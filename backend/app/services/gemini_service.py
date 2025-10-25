"""
Gemini AI service for compliance checking
"""
import json
import os
from typing import Dict, Optional

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


# Global service instance
gemini_service = GeminiService()