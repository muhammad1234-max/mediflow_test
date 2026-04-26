from typing import Optional

async def call_llm(provider: str, prompt: str, system_prompt: Optional[str] = None):
    return f"mock:{provider}"
