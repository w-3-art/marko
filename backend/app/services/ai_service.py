"""
AI Service - Claude integration for Marko
"""
import anthropic
from typing import List, Dict, Optional
from app.core.config import settings

MARKO_SYSTEM_PROMPT = """Tu es Marko, un CMO (Chief Marketing Officer) AI expert en marketing digital et réseaux sociaux.

Ton rôle:
- Aider les PME à définir leur stratégie marketing (la "vibe")
- Créer du contenu engageant pour Instagram et Facebook
- Gérer les campagnes publicitaires Meta
- Expliquer les performances de manière simple et actionnable

Personnalité:
- Professionnel mais accessible
- Direct et concis
- Créatif et stratégique
- Tu parles français naturellement

Capacités:
- Génération de posts, stories, reels, carousels
- Création de copy pour ads
- Analyse de performance
- Suggestions de stratégie

Quand on te demande de créer du contenu:
1. Pose des questions si le brief n'est pas clair
2. Propose plusieurs options quand c'est pertinent
3. Explique tes choix stratégiques
4. Adapte le ton à la marque

Format de réponse pour le contenu:
- Utilise des sections claires
- Inclus les hashtags pertinents
- Suggère le meilleur moment de publication
- Indique le type de contenu (post, story, reel, ad)

Tu as accès aux fonctionnalités suivantes que tu peux déclencher:
- create_content: Créer et sauvegarder du contenu
- publish_content: Publier du contenu sur Meta
- get_analytics: Récupérer les analytics
- schedule_content: Planifier une publication

Réponds toujours de manière utile et actionnable."""

class AIService:
    def __init__(self):
        self.client = anthropic.Anthropic(api_key=settings.anthropic_api_key)
        self.model = "claude-sonnet-4-20250514"
    
    async def chat(
        self, 
        messages: List[Dict[str, str]], 
        context: Optional[Dict] = None
    ) -> str:
        """
        Chat with Marko
        
        Args:
            messages: List of {"role": "user"|"assistant", "content": "..."}
            context: Additional context (user info, campaign info, etc.)
        
        Returns:
            AI response text
        """
        # Check for ONBOARDING_START special message
        if messages and messages[-1].get("content") == "ONBOARDING_START":
            user_name = context.get("user_name", "") if context else ""
            first_name = user_name.split()[0] if user_name else "toi"
            return self._get_onboarding_message(first_name)
        
        system = MARKO_SYSTEM_PROMPT
        
        if context:
            system += f"\n\nContexte actuel:\n"
            if context.get("user_name"):
                system += f"- Utilisateur: {context['user_name']}\n"
            if context.get("company_name"):
                system += f"- Entreprise: {context['company_name']}\n"
            if context.get("campaign"):
                system += f"- Campagne active: {context['campaign']}\n"
            if context.get("meta_connected"):
                system += f"- Compte Meta connecté: Oui\n"
        
        response = self.client.messages.create(
            model=self.model,
            max_tokens=2048,
            system=system,
            messages=messages
        )
        
        return response.content[0].text
    
    def _get_onboarding_message(self, first_name: str) -> str:
        """
        Return the onboarding welcome message for new users.
        """
        return f"""Salut {first_name} ! 👋 Je suis **Marko**, ton CMO IA.

Mon job ? T'aider à créer du contenu marketing qui cartonne sur Instagram et Facebook, sans que t'aies besoin d'être un expert.

Pour bien démarrer, j'aurais besoin d'en savoir un peu plus sur toi :

**C'est quoi ton activité ?** 🏪

Dis-moi en quelques mots ce que tu fais (ex: "Je vends des bijoux faits main", "Je suis coach sportif", "J'ai une boulangerie artisanale"...)

Ça va m'aider à créer du contenu vraiment adapté à ton business !"""
    
    async def generate_content(
        self,
        content_type: str,  # post, story, reel, carousel, ad
        platform: str,  # instagram, facebook
        brief: str,
        brand_voice: Optional[str] = None,
        target_audience: Optional[str] = None,
        objective: Optional[str] = None
    ) -> Dict:
        """
        Generate marketing content
        
        Returns:
            {
                "caption": str,
                "hashtags": List[str],
                "cta": str,
                "visual_suggestion": str,
                "best_time": str,
                "strategy_notes": str
            }
        """
        prompt = f"""Génère du contenu marketing avec les spécifications suivantes:

Type de contenu: {content_type}
Plateforme: {platform}
Brief: {brief}
"""
        if brand_voice:
            prompt += f"Ton de la marque: {brand_voice}\n"
        if target_audience:
            prompt += f"Audience cible: {target_audience}\n"
        if objective:
            prompt += f"Objectif: {objective}\n"
        
        prompt += """
Réponds en JSON avec cette structure exacte:
{
    "caption": "Le texte du post/ad",
    "hashtags": ["hashtag1", "hashtag2", ...],
    "cta": "Call to action suggéré",
    "visual_suggestion": "Description du visuel recommandé",
    "best_time": "Meilleur moment pour publier",
    "strategy_notes": "Notes stratégiques et explications"
}
"""
        
        response = self.client.messages.create(
            model=self.model,
            max_tokens=1024,
            system="Tu es un expert en marketing digital. Réponds uniquement en JSON valide.",
            messages=[{"role": "user", "content": prompt}]
        )
        
        # Parse JSON response
        import json
        try:
            # Extract JSON from response
            text = response.content[0].text
            # Handle potential markdown code blocks
            if "```json" in text:
                text = text.split("```json")[1].split("```")[0]
            elif "```" in text:
                text = text.split("```")[1].split("```")[0]
            return json.loads(text.strip())
        except:
            # Fallback if JSON parsing fails
            return {
                "caption": response.content[0].text,
                "hashtags": [],
                "cta": "",
                "visual_suggestion": "",
                "best_time": "",
                "strategy_notes": ""
            }
    
    async def analyze_performance(
        self,
        metrics: Dict,
        content_type: str,
        industry: Optional[str] = None
    ) -> str:
        """
        Analyze content performance and provide insights
        """
        prompt = f"""Analyse ces métriques de performance pour un {content_type}:

Métriques:
- Impressions: {metrics.get('impressions', 0)}
- Portée: {metrics.get('reach', 0)}
- Engagement: {metrics.get('engagement', 0)}
- Likes: {metrics.get('likes', 0)}
- Commentaires: {metrics.get('comments', 0)}
- Partages: {metrics.get('shares', 0)}
- Clics: {metrics.get('clicks', 0)}
"""
        if metrics.get('spend'):
            prompt += f"- Dépense: {metrics['spend']/100}€\n"
            prompt += f"- CPC: {metrics.get('cpc', 0)/100}€\n"
            prompt += f"- ROAS: {metrics.get('roas', 0)/100}x\n"
        
        if industry:
            prompt += f"\nIndustrie: {industry}\n"
        
        prompt += """
Fournis une analyse en français avec:
1. Performance globale (bien/moyen/à améliorer)
2. Points forts
3. Points à améliorer
4. Recommandations concrètes pour le prochain contenu
"""
        
        response = self.client.messages.create(
            model=self.model,
            max_tokens=1024,
            system=MARKO_SYSTEM_PROMPT,
            messages=[{"role": "user", "content": prompt}]
        )
        
        return response.content[0].text
    
    async def generate_strategy(
        self,
        business_description: str,
        goals: str,
        budget: Optional[int] = None,
        duration_days: int = 30
    ) -> Dict:
        """
        Generate a marketing strategy/calendar
        """
        prompt = f"""Crée une stratégie marketing pour:

Business: {business_description}
Objectifs: {goals}
Durée: {duration_days} jours
"""
        if budget:
            prompt += f"Budget: {budget}€\n"
        
        prompt += """
Réponds en JSON avec cette structure:
{
    "vibe": "La tonalité/ambiance générale de la communication",
    "content_pillars": ["Pilier 1", "Pilier 2", "Pilier 3"],
    "weekly_cadence": {
        "posts_per_week": 3,
        "stories_per_week": 5,
        "reels_per_week": 2,
        "ads": true
    },
    "content_ideas": [
        {"type": "post", "idea": "...", "day": "lundi"},
        {"type": "reel", "idea": "...", "day": "mercredi"}
    ],
    "hashtag_strategy": ["hashtag1", "hashtag2"],
    "best_posting_times": ["10h", "18h"],
    "budget_allocation": {
        "awareness": 30,
        "engagement": 40,
        "conversion": 30
    }
}
"""
        
        response = self.client.messages.create(
            model=self.model,
            max_tokens=2048,
            system="Tu es un stratège marketing expert. Réponds uniquement en JSON valide.",
            messages=[{"role": "user", "content": prompt}]
        )
        
        import json
        try:
            text = response.content[0].text
            if "```json" in text:
                text = text.split("```json")[1].split("```")[0]
            elif "```" in text:
                text = text.split("```")[1].split("```")[0]
            return json.loads(text.strip())
        except:
            return {"error": "Could not parse strategy", "raw": response.content[0].text}

# Singleton instance
ai_service = AIService()
