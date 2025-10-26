"""
Document Intelligence API endpoints
"""
import base64
import json
import uuid
from datetime import datetime
from typing import Dict, List, Optional

from app.core.database import get_db
from app.models.database import Document as DocumentModel
from app.models.database import Expense as ExpenseModel
from app.models.database import Grant as GrantModel
from app.services.gemini_service import gemini_service
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from pydantic import BaseModel
from sqlalchemy.orm import Session

router = APIRouter()


class DocumentUploadResponse(BaseModel):
    document_id: str
    filename: str
    document_type: str
    extracted_data: Dict
    confidence_score: float
    processing_status: str


class DocumentAnalysisResponse(BaseModel):
    document_id: str
    analysis_type: str
    key_terms: List[str]
    compliance_notes: List[str]
    risk_score: float
    recommendations: List[str]


class ComplianceDocumentResponse(BaseModel):
    document_id: str
    grant_id: int
    compliance_summary: str
    key_requirements: List[str]
    compliance_score: float
    generated_at: datetime


@router.post("/upload", response_model=DocumentUploadResponse)
async def upload_document(
    file: UploadFile = File(...),
    document_type: str = "receipt",
    grant_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """Upload and process a document using AI"""
    try:
        # Generate unique document ID
        document_id = str(uuid.uuid4())
        
        # Read file content
        content = await file.read()
        
        # Convert to base64 for AI processing
        content_base64 = base64.b64encode(content).decode('utf-8')
        
        # Process document based on type
        if document_type == "receipt":
            extracted_data = await _process_receipt(content_base64, file.filename)
        elif document_type == "contract":
            extracted_data = await _process_contract(content_base64, file.filename)
        elif document_type == "invoice":
            extracted_data = await _process_invoice(content_base64, file.filename)
        else:
            extracted_data = await _process_general_document(content_base64, file.filename)
        
        # Calculate confidence score
        confidence_score = _calculate_confidence_score(extracted_data)
        
        # Save document to database
        db_document = DocumentModel(
            id=document_id,
            filename=file.filename,
            document_type=document_type,
            grant_id=grant_id,
            extracted_data=json.dumps(extracted_data),
            confidence_score=confidence_score,
            processing_status="completed",
            created_at=datetime.utcnow()
        )
        
        db.add(db_document)
        db.commit()
        db.refresh(db_document)
        
        return DocumentUploadResponse(
            document_id=document_id,
            filename=file.filename,
            document_type=document_type,
            extracted_data=extracted_data,
            confidence_score=confidence_score,
            processing_status="completed"
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process document: {str(e)}")


@router.post("/analyze/{document_id}", response_model=DocumentAnalysisResponse)
def analyze_document(
    document_id: str,
    analysis_type: str = "compliance",
    db: Session = Depends(get_db)
):
    """Perform AI analysis on a document"""
    try:
        # Get document from database
        document = db.query(DocumentModel).filter(DocumentModel.id == document_id).first()
        if not document:
            raise HTTPException(status_code=404, detail="Document not found")
        
        # Perform analysis based on type
        if analysis_type == "compliance":
            analysis_result = _analyze_compliance(document)
        elif analysis_type == "contract":
            analysis_result = _analyze_contract(document)
        elif analysis_type == "risk":
            analysis_result = _analyze_risk(document)
        else:
            analysis_result = _analyze_general(document)
        
        return DocumentAnalysisResponse(
            document_id=document_id,
            analysis_type=analysis_type,
            **analysis_result
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to analyze document: {str(e)}")


@router.post("/generate-compliance/{grant_id}", response_model=ComplianceDocumentResponse)
def generate_compliance_document(
    grant_id: int,
    db: Session = Depends(get_db)
):
    """Generate automated compliance documentation for a grant"""
    try:
        # Get grant information
        grant = db.query(GrantModel).filter(GrantModel.id == grant_id).first()
        if not grant:
            raise HTTPException(status_code=404, detail="Grant not found")
        
        # Get all expenses for this grant
        expenses = db.query(ExpenseModel).filter(ExpenseModel.grant_id == grant_id).all()
        
        # Get all documents for this grant
        documents = db.query(DocumentModel).filter(DocumentModel.grant_id == grant_id).all()
        
        # Generate compliance summary using AI
        compliance_data = {
            "grant_name": grant.name,
            "grant_rules": grant.rules_text,
            "total_amount": grant.total_amount,
            "expenses": [
                {
                    "description": exp.description,
                    "amount": exp.amount,
                    "status": exp.status,
                    "compliance_check": exp.ai_compliance_check
                }
                for exp in expenses
            ],
            "documents": [
                {
                    "filename": doc.filename,
                    "type": doc.document_type,
                    "confidence": doc.confidence_score
                }
                for doc in documents
            ]
        }
        
        # Generate compliance summary using AI
        compliance_summary = gemini_service.generate_compliance_summary(compliance_data)
        
        # Extract key requirements
        key_requirements = _extract_key_requirements(grant.rules_text)
        
        # Calculate compliance score
        compliance_score = _calculate_compliance_score(expenses, documents)
        
        return ComplianceDocumentResponse(
            document_id=str(uuid.uuid4()),
            grant_id=grant_id,
            compliance_summary=compliance_summary,
            key_requirements=key_requirements,
            compliance_score=compliance_score,
            generated_at=datetime.utcnow()
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate compliance document: {str(e)}")


@router.get("/{document_id}")
def get_document(document_id: str, db: Session = Depends(get_db)):
    """Get document details and extracted data"""
    try:
        document = db.query(DocumentModel).filter(DocumentModel.id == document_id).first()
        if not document:
            raise HTTPException(status_code=404, detail="Document not found")
        
        return {
            "id": document.id,
            "filename": document.filename,
            "document_type": document.document_type,
            "grant_id": document.grant_id,
            "extracted_data": json.loads(document.extracted_data),
            "confidence_score": document.confidence_score,
            "processing_status": document.processing_status,
            "created_at": document.created_at
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get document: {str(e)}")


@router.get("/grant/{grant_id}")
def get_grant_documents(grant_id: int, db: Session = Depends(get_db)):
    """Get all documents for a specific grant"""
    try:
        documents = db.query(DocumentModel).filter(DocumentModel.grant_id == grant_id).all()
        
        return [
            {
                "id": doc.id,
                "filename": doc.filename,
                "document_type": doc.document_type,
                "confidence_score": doc.confidence_score,
                "processing_status": doc.processing_status,
                "created_at": doc.created_at
            }
            for doc in documents
        ]
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get grant documents: {str(e)}")


# Helper functions for document processing

async def _process_receipt(content_base64: str, filename: str) -> Dict:
    """Process receipt using AI OCR and data extraction"""
    prompt = f"""
    Analyze this receipt image and extract the following information in JSON format:
    {{
        "merchant_name": "Name of the business",
        "date": "Date of purchase (YYYY-MM-DD format)",
        "total_amount": "Total amount as number",
        "items": [
            {{
                "description": "Item description",
                "amount": "Item amount as number"
            }}
        ],
        "tax_amount": "Tax amount as number",
        "payment_method": "Payment method used",
        "receipt_number": "Receipt or transaction number"
    }}
    
    Be as accurate as possible. If any information is unclear, use null for that field.
    """
    
    return gemini_service.extract_document_data(content_base64, prompt, "receipt")


async def _process_contract(content_base64: str, filename: str) -> Dict:
    """Process contract using AI analysis"""
    prompt = f"""
    Analyze this contract document and extract key information in JSON format:
    {{
        "contract_title": "Title of the contract",
        "parties": ["List of parties involved"],
        "key_terms": ["Important terms and conditions"],
        "financial_obligations": [
            {{
                "description": "Obligation description",
                "amount": "Amount as number",
                "due_date": "Due date if specified"
            }}
        ],
        "compliance_requirements": ["List of compliance requirements"],
        "termination_clauses": ["Termination conditions"],
        "risk_factors": ["Potential risk factors identified"]
    }}
    """
    
    return gemini_service.extract_document_data(content_base64, prompt, "contract")


async def _process_invoice(content_base64: str, filename: str) -> Dict:
    """Process invoice using AI OCR"""
    prompt = f"""
    Analyze this invoice and extract the following information in JSON format:
    {{
        "vendor_name": "Vendor or supplier name",
        "invoice_number": "Invoice number",
        "invoice_date": "Invoice date (YYYY-MM-DD format)",
        "due_date": "Payment due date (YYYY-MM-DD format)",
        "total_amount": "Total amount",
        "line_items": [
            {{
                "description": "Item description",
                "quantity": "Quantity as number",
                "unit_price": "Unit price as number",
                "total_price": "Total price as number"
            }}
        ],
        "tax_amount": "Tax amount as number",
        "payment_terms": "Payment terms and conditions"
    }}
    """
    
    return gemini_service.extract_document_data(content_base64, prompt, "invoice")


async def _process_general_document(content_base64: str, filename: str) -> Dict:
    """Process general document"""
    prompt = f"""
    Analyze this document and extract key information in JSON format:
    {{
        "document_type": "Type of document",
        "key_information": ["Important information extracted"],
        "dates": ["Any dates mentioned"],
        "amounts": ["Any monetary amounts mentioned"],
        "parties": ["People or organizations mentioned"],
        "summary": "Brief summary of the document content"
    }}
    """
    
    return gemini_service.extract_document_data(content_base64, prompt, "general")


def _calculate_confidence_score(extracted_data: Dict) -> float:
    """Calculate confidence score based on extracted data quality"""
    score = 0.0
    total_fields = 0
    
    for key, value in extracted_data.items():
        total_fields += 1
        if value is not None and value != "" and value != []:
            score += 1.0
    
    return (score / total_fields) if total_fields > 0 else 0.0


def _analyze_compliance(document: DocumentModel) -> Dict:
    """Analyze document for compliance issues"""
    extracted_data = json.loads(document.extracted_data)
    
    # Use AI to analyze compliance
    analysis_prompt = f"""
    Analyze this document for compliance issues and provide:
    1. Key compliance requirements identified
    2. Potential compliance risks
    3. Recommendations for improvement
    
    Document data: {extracted_data}
    """
    
    ai_analysis = gemini_service.generate_insights(
        analysis_prompt,
        "You are a compliance expert. Analyze documents for compliance issues.",
        extracted_data
    )
    
    return {
        "key_terms": _extract_key_terms(ai_analysis),
        "compliance_notes": _extract_compliance_notes(ai_analysis),
        "risk_score": _calculate_risk_score(extracted_data),
        "recommendations": _extract_recommendations(ai_analysis)
    }


def _analyze_contract(document: DocumentModel) -> Dict:
    """Analyze contract document"""
    extracted_data = json.loads(document.extracted_data)
    
    return {
        "key_terms": extracted_data.get("key_terms", []),
        "compliance_notes": extracted_data.get("compliance_requirements", []),
        "risk_score": _calculate_contract_risk(extracted_data),
        "recommendations": _generate_contract_recommendations(extracted_data)
    }


def _analyze_risk(document: DocumentModel) -> Dict:
    """Analyze document for risk factors"""
    extracted_data = json.loads(document.extracted_data)
    
    return {
        "key_terms": extracted_data.get("risk_factors", []),
        "compliance_notes": ["Risk analysis completed"],
        "risk_score": _calculate_risk_score(extracted_data),
        "recommendations": _generate_risk_recommendations(extracted_data)
    }


def _analyze_general(document: DocumentModel) -> Dict:
    """General document analysis"""
    extracted_data = json.loads(document.extracted_data)
    
    return {
        "key_terms": extracted_data.get("key_information", []),
        "compliance_notes": ["General analysis completed"],
        "risk_score": 0.5,  # Default medium risk
        "recommendations": ["Review document for specific requirements"]
    }


def _extract_key_requirements(rules_text: str) -> List[str]:
    """Extract key requirements from grant rules"""
    prompt = f"""
    Extract key compliance requirements from this grant rules text:
    {rules_text}
    
    Return as a list of specific requirements.
    """
    
    return gemini_service.extract_requirements(rules_text)


def _calculate_compliance_score(expenses: List, documents: List) -> float:
    """Calculate overall compliance score for a grant"""
    if not expenses:
        return 1.0
    
    compliant_expenses = sum(1 for exp in expenses if exp.status == "approved")
    total_expenses = len(expenses)
    
    # Factor in document confidence scores
    avg_document_confidence = sum(doc.confidence_score for doc in documents) / len(documents) if documents else 1.0
    
    compliance_ratio = compliant_expenses / total_expenses
    return (compliance_ratio + avg_document_confidence) / 2


# Additional helper functions
def _extract_key_terms(analysis: str) -> List[str]:
    """Extract key terms from AI analysis"""
    # Simple extraction - in production, use more sophisticated NLP
    return analysis.split('\n')[:5] if analysis else []


def _extract_compliance_notes(analysis: str) -> List[str]:
    """Extract compliance notes from AI analysis"""
    return analysis.split('\n') if analysis else []


def _calculate_risk_score(data: Dict) -> float:
    """Calculate risk score based on document data"""
    # Simple risk calculation - in production, use more sophisticated algorithms
    risk_factors = 0
    if "risk_factors" in data:
        risk_factors += len(data["risk_factors"])
    
    return min(risk_factors * 0.1, 1.0)


def _extract_recommendations(analysis: str) -> List[str]:
    """Extract recommendations from AI analysis"""
    return analysis.split('\n') if analysis else []


def _calculate_contract_risk(data: Dict) -> float:
    """Calculate contract-specific risk score"""
    risk_score = 0.0
    
    if "risk_factors" in data:
        risk_score += len(data["risk_factors"]) * 0.2
    
    if "termination_clauses" in data:
        risk_score += len(data["termination_clauses"]) * 0.1
    
    return min(risk_score, 1.0)


def _generate_contract_recommendations(data: Dict) -> List[str]:
    """Generate contract-specific recommendations"""
    recommendations = []
    
    if "financial_obligations" in data:
        recommendations.append("Review all financial obligations carefully")
    
    if "compliance_requirements" in data:
        recommendations.append("Ensure all compliance requirements are met")
    
    return recommendations


def _generate_risk_recommendations(data: Dict) -> List[str]:
    """Generate risk-specific recommendations"""
    recommendations = []
    
    if "risk_factors" in data and data["risk_factors"]:
        recommendations.append("Address identified risk factors")
        recommendations.append("Consider risk mitigation strategies")
    
    return recommendations
