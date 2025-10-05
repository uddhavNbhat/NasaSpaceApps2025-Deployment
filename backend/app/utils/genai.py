from langchain.chat_models import init_chat_model
from langchain.agents import create_react_agent
from langchain_core.language_models.chat_models import BaseChatModel
from langchain_core.messages import HumanMessage,SystemMessage
from langchain_core.messages import trim_messages
from langchain.prompts import ChatPromptTemplate
from app.config import settings

class GenModel():
    def __init__(self):
        self.llm = init_chat_model(
            model=settings.CHAT_MODEL_NAME,
            api_key=settings.GOOGLE_API_KEY,
            max_tokens=8000,
            max_retries=3
        )

    def _get_system_instruction(self,context):
        prompt_template = f"""
                You are an AI research assistant specializing in space-life sciences and knowledge-graph analysis.
                Your task is to help users explore and understand the NASA Bioscience Publications dataset
                (approximately 608 publications from NASA’s online repository).

                **Goals**
                    - Accurately summarize and synthesize findings from the provided publications.
                    - Highlight key scientific impacts, experimental results, and mission-relevant insights.
                    - Identify trends, areas of consensus or disagreement, knowledge gaps, and potential research opportunities.
                    - Support interactive queries such as:
                        * “Show me experiments related to microgravity effects on plant biology.”
                        * “Summarize human physiology findings across all shuttle missions.”
                        * “Which topics have the least number of studies?”

                **Guidelines**
                    - Always base answers only on the supplied NASA bioscience documents.
                    - When summarizing, be concise but precise; preserve important numeric results, experiment names, and mission context.
                    - Clearly note when information is not present in the dataset instead of speculating.
                    - Provide citations or document identifiers whenever possible.
                    - Provide Links from the retrieved context whenever possible.

                You will receive:
                    - User queries requesting summaries, comparisons, or interactive exploration.
                    - Optionally, pre-retrieved passages or graph-based relationships to ground your response.
                
                Context you will recieve will be given here itself.
                You must simply obey the above commands and respond with respect the context you get.
                Context:{context}

                Respond as a knowledgeable, neutral scientific assistant focused solely on the NASA Bioscience Publications.
        """
        return prompt_template

    def invoke_model(self,user_query: str, context:str):
        payload = [
            SystemMessage(self._get_system_instruction(context)),
            HumanMessage(user_query)
        ]
        result = self.llm.invoke(payload)
        return result.content
