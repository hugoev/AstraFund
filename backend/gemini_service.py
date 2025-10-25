import json
import os

import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

# Configure Gemini API
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

def check_compliance(grant_rules: str, expense_description: str, expense_amount: float) -> dict:
    """
    Use Gemini API to check if an expense complies with grant rules.
    Returns a dictionary with is_compliant and justification.
    """
    try:
        # Create the model
        model = genai.GenerativeModel('gemini-pro')
        
        # System prompt for the AI
        system_prompt = """You are an expert grant compliance officer. You will be given a set of grant rules and a proposed expense. Your only job is to determine if the expense is compliant with the rules. Provide your answer only in the following JSON format: {"is_compliant": boolean, "justification": "Your one-sentence justification here."}. If the expense '10 Raspberry Pis' is for a 'STEM Education' grant, you would say it's compliant. If it's for an 'Arts' grant, you would say it's non-compliant."""
        
        # User prompt with the specific data
        user_prompt = f"""Grant Rules: {grant_rules}

Proposed Expense: A purchase of '{expense_description}' for ${expense_amount}."""
        
        # Combine system and user prompts
        full_prompt = f"{system_prompt}\n\n{user_prompt}"
        
        # Generate response
        response = model.generate_content(full_prompt)
        
        # Parse the JSON response
        try:
            result = json.loads(response.text.strip())
            return result
        except json.JSONDecodeError:
            # Fallback if JSON parsing fails
            return {
                "is_compliant": False,
                "justification": "Unable to parse AI response. Please review manually."
            }
            
    except Exception as e:
        print(f"Error calling Gemini API: {e}")
        return {
            "is_compliant": False,
            "justification": f"AI service error: {str(e)}"
        }
