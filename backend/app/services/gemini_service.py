"""
Gemini AI service for compliance checking
"""
import json
import os
from typing import Dict, List, Optional

from app.core.config import settings
from app.core.logging import get_logger
from google import genai

logger = get_logger(__name__)


class GeminiService:
    """Service for AI compliance checking using Google Gemini"""
    
    def __init__(self):
        self.api_key = settings.gemini_api_key
        self.client = None
        self._configure_gemini()
    
    def _configure_gemini(self) -> None:
        """Configure Gemini API"""
        if not self.api_key or self.api_key == "dummy_key_for_demo":
            logger.warning("Gemini API key not configured - running in demo mode")
            return
        
        try:
            self.client = genai.Client(api_key=self.api_key)
            logger.info("Gemini API configured successfully")
        except Exception as e:
            logger.error(f"Failed to configure Gemini API: {e}")
    
    def check_compliance(
        self, 
        grant_rules: str, 
        expense_description: str, 
        expense_amount: float
    ) -> Dict[str, any]:
        """
        Check if an expense complies with grant rules using AI
        
        Args:
            grant_rules: The grant rules text
            expense_description: Description of the expense
            expense_amount: Amount of the expense
            
        Returns:
            Dict with 'is_compliant' and 'justification' keys
        """
        # Demo mode if no API key
        if not self.api_key or self.api_key == "dummy_key_for_demo" or not self.client:
            return self._demo_compliance_check(expense_description)
        
        try:
            system_prompt = self._get_system_prompt()
            user_prompt = self._get_user_prompt(grant_rules, expense_description, expense_amount)
            full_prompt = f"{system_prompt}\n\n{user_prompt}"
            
            # Use the new Google GenAI SDK
            response = self.client.models.generate_content(
                model="gemini-2.5-flash",
                contents=full_prompt
            )
            
            try:
                result = json.loads(response.text.strip())
                logger.info(f"Compliance check completed: {result}")
                return result
            except json.JSONDecodeError:
                logger.error("Failed to parse Gemini response as JSON")
                return {
                    "is_compliant": False,
                    "justification": "Unable to parse AI response. Please review manually."
                }
                
        except Exception as e:
            logger.error(f"Gemini API error: {e}")
            return {
                "is_compliant": False,
                "justification": f"AI service error: {str(e)}"
            }
    
    def _get_system_prompt(self) -> str:
        """Get the system prompt for Gemini"""
        return """You are an expert grant compliance officer. You will be given a set of grant rules and a proposed expense. Your only job is to determine if the expense is compliant with the rules. Provide your answer only in the following JSON format: {"is_compliant": boolean, "justification": "Your one-sentence justification here."}. If the expense '10 Raspberry Pis' is for a 'STEM Education' grant, you would say it's compliant. If it's for an 'Arts' grant, you would say it's non-compliant."""
    
    def _get_user_prompt(self, grant_rules: str, expense_description: str, expense_amount: float) -> str:
        """Get the user prompt for Gemini"""
        return f"""Grant Rules: {grant_rules}

Proposed Expense: A purchase of '{expense_description}' for ${expense_amount}."""
    
    def generate_insights(
        self,
        user_message: str,
        system_prompt: str,
        analytics_data: Dict
    ) -> str:
        """
        Generate AI insights based on analytics data
        
        Args:
            user_message: The user's question or request
            system_prompt: System prompt for context
            analytics_data: Current analytics data
            
        Returns:
            AI-generated response string
        """
        # Demo mode if no API key
        if not self.api_key or self.api_key == "dummy_key_for_demo" or not self.client:
            return self._demo_insights_response(user_message, analytics_data)
        
        try:
            full_prompt = f"{system_prompt}\n\nUser Question: {user_message}"
            
            response = self.client.models.generate_content(
                model="gemini-2.5-flash",
                contents=full_prompt
            )
            
            logger.info("AI insights generated successfully")
            return response.text.strip()
            
        except Exception as e:
            logger.error(f"Gemini insights error: {e}")
            return f"I apologize, but I'm having trouble analyzing your data right now. Error: {str(e)}"
    
    def _demo_insights_response(self, user_message: str, analytics_data: Dict) -> str:
        """Demo mode insights response"""
        total_grants = analytics_data.get('total_grants', 0)
        total_spent = analytics_data.get('total_spent', 0)
        total_grant_amount = analytics_data.get('total_grant_amount', 0)
        compliance_rate = analytics_data.get('compliance_rate', 0)
        
        # Generate basic insights based on data
        insights = []
        
        if total_grants > 0:
            insights.append(f"You have {total_grants} active grants in your system.")
        
        if total_grant_amount > 0:
            utilization = (total_spent / total_grant_amount) * 100
            insights.append(f"Budget utilization is at {utilization:.1f}% (${total_spent:,.2f} of ${total_grant_amount:,.2f}).")
            
            if utilization > 90:
                insights.append("⚠️ High budget utilization - consider reviewing remaining funds.")
            elif utilization < 30:
                insights.append("💡 Low budget utilization - you have room for more activities.")
        
        if compliance_rate > 80:
            insights.append("✅ Excellent compliance rate indicates good expense management.")
        elif compliance_rate < 50:
            insights.append("⚠️ Low compliance rate - consider reviewing expense guidelines.")
        
        # Simple keyword-based responses
        if "budget" in user_message.lower():
            return f"Based on your current data: {'. '.join(insights)}"
        elif "compliance" in user_message.lower():
            return f"Your compliance rate is {compliance_rate}%. {insights[-1] if insights else 'Consider reviewing your expense submission process.'}"
        elif "trend" in user_message.lower():
            return f"Here are some key insights: {'. '.join(insights[:3])}"
        else:
            return f"Here's what I can tell you about your grant management: {'. '.join(insights)}"

    def _demo_compliance_check(self, expense_description: str) -> Dict[str, any]:
        """Demo mode compliance check"""
        # Simple heuristic for demo
        if any(keyword in expense_description.lower() for keyword in ['raspberry', 'computer', 'technology', 'stem']):
            return {
                "is_compliant": True,
                "justification": "Demo mode: This appears to be a technology-related expense suitable for STEM grants."
            }
        elif any(keyword in expense_description.lower() for keyword in ['art', 'paint', 'canvas', 'brush']):
            return {
                "is_compliant": True,
                "justification": "Demo mode: This appears to be an arts-related expense suitable for arts grants."
            }
        else:
            return {
                "is_compliant": False,
                "justification": "Demo mode: Please review this expense manually as it doesn't match common patterns."
            }


    def extract_document_data(self, content_base64: str, prompt: str, document_type: str) -> Dict:
        """Extract data from documents using AI"""
        try:
            system_prompt = f"""You are an expert document analysis AI. Analyze the provided document and extract structured data according to the given format. Be precise and accurate in your extraction."""
            
            user_prompt = f"""
            Document Type: {document_type}
            Analysis Instructions: {prompt}
            
            Please analyze the document and return the requested information in valid JSON format.
            """
            
            response = self.client.models.generate_content(
                model="gemini-2.5-flash",
                contents=user_prompt,
                generation_config={
                    "temperature": 0.1,
                    "top_p": 0.8,
                    "top_k": 40,
                    "max_output_tokens": 2048,
                }
            )
            
            # Parse JSON response
            try:
                extracted_data = json.loads(response.text)
                return extracted_data
            except json.JSONDecodeError:
                # Fallback if JSON parsing fails
                return {
                    "error": "Failed to parse AI response",
                    "raw_response": response.text,
                    "document_type": document_type
                }
                
        except Exception as e:
            logger.error(f"Error extracting document data: {str(e)}")
            return {
                "error": f"Document processing failed: {str(e)}",
                "document_type": document_type
            }
    
    def generate_compliance_summary(self, compliance_data: Dict) -> str:
        """Generate compliance summary using AI"""
        try:
            system_prompt = """You are an expert compliance analyst. Generate a comprehensive compliance summary for grant management."""
            
            user_prompt = f"""
            Generate a compliance summary for the following grant data:
            
            Grant: {compliance_data.get('grant_name', 'Unknown')}
            Rules: {compliance_data.get('grant_rules', 'No rules specified')}
            Total Amount: ${compliance_data.get('total_amount', 0)}
            
            Expenses: {len(compliance_data.get('expenses', []))} total
            Documents: {len(compliance_data.get('documents', []))} total
            
            Provide a comprehensive compliance summary including:
            1. Overall compliance status
            2. Key compliance metrics
            3. Areas of concern
            4. Recommendations for improvement
            """
            
            response = self.client.models.generate_content(
                model="gemini-2.5-flash",
                contents=user_prompt,
                generation_config={
                    "temperature": 0.3,
                    "top_p": 0.8,
                    "top_k": 40,
                    "max_output_tokens": 1024,
                }
            )
            
            return response.text
            
        except Exception as e:
            logger.error(f"Error generating compliance summary: {str(e)}")
            return f"Compliance summary generation failed: {str(e)}"
    
    def extract_requirements(self, rules_text: str) -> List[str]:
        """Extract key requirements from grant rules"""
        try:
            system_prompt = """You are an expert at analyzing grant rules and extracting key compliance requirements."""

            user_prompt = f"""
            Extract the key compliance requirements from this grant rules text:

            {rules_text}

            Return a list of specific, actionable requirements. Each requirement should be clear and measurable.
            """

            response = self.client.models.generate_content(
                model="gemini-2.5-flash",
                contents=user_prompt,
                generation_config={
                    "temperature": 0.2,
                    "top_p": 0.8,
                    "top_k": 40,
                    "max_output_tokens": 512,
                }
            )

            # Parse response into list
            requirements = response.text.strip().split('\n')
            return [req.strip('- ').strip() for req in requirements if req.strip()]

        except Exception as e:
            logger.error(f"Error extracting requirements: {str(e)}")
            return ["Unable to extract requirements at this time."]

    def suggest_expense_allocation(self, expense_description: str, expense_amount: float, available_grants: List[Dict]) -> Dict:
        """Suggest the best grant allocation for an expense"""
        try:
            grants_info = "\n".join([
                f"Grant: {grant['name']} - Rules: {grant['rules_text'][:200]}... - Remaining: ${grant.get('remaining_amount', 0)}"
                for grant in available_grants
            ])

            system_prompt = """You are a financial compliance co-pilot for nonprofits. Your job is to suggest the best grant allocation for expenses while ensuring compliance."""

            user_prompt = f"""
            Expense: {expense_description} for ${expense_amount}

            Available Grants:
            {grants_info}

            Analyze this expense and suggest:
            1. Which grant is most appropriate (or if none are suitable)
            2. Any compliance concerns
            3. Alternative approaches if needed
            4. Confidence level in the recommendation

            Return your analysis in JSON format with fields: recommended_grant_id, confidence_score, compliance_notes, alternatives, warnings
            """

            response = self.client.models.generate_content(
                model="gemini-2.5-flash",
                contents=user_prompt,
                generation_config={
                    "temperature": 0.3,
                    "top_p": 0.8,
                    "top_k": 40,
                    "max_output_tokens": 1024,
                }
            )

            # Parse JSON response
            try:
                suggestion = json.loads(response.text)
                return suggestion
            except json.JSONDecodeError:
                return {
                    "recommended_grant_id": None,
                    "confidence_score": 0.0,
                    "compliance_notes": "Unable to analyze expense",
                    "alternatives": [],
                    "warnings": ["AI analysis failed"]
                }

        except Exception as e:
            logger.error(f"Error suggesting expense allocation: {str(e)}")
            return {
                "recommended_grant_id": None,
                "confidence_score": 0.0,
                "compliance_notes": f"Analysis failed: {str(e)}",
                "alternatives": [],
                "warnings": ["Service unavailable"]
            }

    def analyze_proposal_compliance(self, title: str, description: str, requested_amount: float, proposal_type: str) -> Dict:
        """Analyze a grant proposal for compliance and quality"""
        try:
            system_prompt = """You are an expert grant proposal reviewer for nonprofit organizations. Your job is to analyze proposals for compliance, quality, and alignment with funding criteria."""

            user_prompt = f"""
            Analyze this grant proposal for compliance and quality:

            Title: {title}
            Type: {proposal_type}
            Requested Amount: ${requested_amount:,.2f}
            Description: {description}

            Provide analysis in JSON format with:
            1. compliance_score (0.0-1.0)
            2. compliance_notes (detailed analysis)
            3. recommendation (approve/reject/conditional)
            4. risk_factors (list of concerns)
            5. strengths (list of positive aspects)

            Focus on:
            - Alignment with proposal type
            - Reasonableness of requested amount
            - Clarity and completeness of description
            - Potential compliance issues
            """

            response = self.client.models.generate_content(
                model="gemini-2.5-flash",
                contents=user_prompt,
                generation_config={
                    "temperature": 0.3,
                    "top_p": 0.8,
                    "top_k": 40,
                    "max_output_tokens": 1024,
                }
            )

            # Parse JSON response
            try:
                analysis = json.loads(response.text)
                return analysis
            except json.JSONDecodeError:
                return {
                    "compliance_score": 0.5,
                    "compliance_notes": "Unable to analyze proposal - AI response parsing failed",
                    "recommendation": "conditional",
                    "risk_factors": ["Analysis failed"],
                    "strengths": []
                }

        except Exception as e:
            logger.error(f"Error analyzing proposal compliance: {str(e)}")
            return {
                "compliance_score": 0.0,
                "compliance_notes": f"Analysis failed: {str(e)}",
                "recommendation": "reject",
                "risk_factors": ["Service unavailable"],
                "strengths": []
            }

    def get_budget_optimization_suggestions(self, grant_name: str, total_budget: float, current_spent: float, remaining: float, grant_rules: str) -> Dict:
        """Get AI-powered budget optimization suggestions"""
        try:
            utilization_rate = (current_spent / total_budget) * 100 if total_budget > 0 else 0
            
            system_prompt = """You are an expert financial advisor for nonprofit organizations. Your job is to analyze budget utilization and provide optimization suggestions."""

            user_prompt = f"""
            Analyze this grant's budget utilization and provide optimization suggestions:

            Grant: {grant_name}
            Total Budget: ${total_budget:,.2f}
            Current Spent: ${current_spent:,.2f}
            Remaining: ${remaining:,.2f}
            Utilization Rate: {utilization_rate:.1f}%

            Grant Rules: {grant_rules[:500]}...

            Provide optimization suggestions in JSON format with:
            1. suggestions (list of optimization recommendations)
            2. risk_level (low/medium/high)
            3. confidence_score (0.0-1.0)

            Each suggestion should have:
            - type (increase/decrease/reallocate)
            - amount (suggested change amount)
            - reason (explanation)
            - impact (expected outcome)
            """

            response = self.client.models.generate_content(
                model="gemini-2.5-flash",
                contents=user_prompt,
                generation_config={
                    "temperature": 0.3,
                    "top_p": 0.8,
                    "top_k": 40,
                    "max_output_tokens": 1024,
                }
            )

            # Parse JSON response
            try:
                suggestions = json.loads(response.text)
                return suggestions
            except json.JSONDecodeError:
                # Fallback suggestions based on utilization rate
                if utilization_rate < 30:
                    return {
                        "suggestions": [
                            {
                                "type": "increase",
                                "amount": total_budget * 0.1,
                                "reason": "Low utilization rate suggests opportunity to increase program impact",
                                "impact": "Could expand program reach by 20%"
                            }
                        ],
                        "risk_level": "low",
                        "confidence_score": 0.7
                    }
                elif utilization_rate > 80:
                    return {
                        "suggestions": [
                            {
                                "type": "decrease",
                                "amount": total_budget * 0.05,
                                "reason": "High utilization rate - consider cost optimization",
                                "impact": "Could reduce costs by 5% without impacting program quality"
                            }
                        ],
                        "risk_level": "medium",
                        "confidence_score": 0.8
                    }
                else:
                    return {
                        "suggestions": [],
                        "risk_level": "low",
                        "confidence_score": 0.9
                    }

        except Exception as e:
            logger.error(f"Error getting budget optimization suggestions: {str(e)}")
            return {
                "suggestions": [],
                "risk_level": "medium",
                "confidence_score": 0.0
            }


# Global service instance
gemini_service = GeminiService()