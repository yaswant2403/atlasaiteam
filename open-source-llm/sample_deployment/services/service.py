import torch 
import bentoml
from transformers import GenerationConfig
from bentoml.io import Text, JSON

PROMPT = "Here is a description of an ATLAS intern, help generate a spotlight paragraph for this intern."

llm = bentoml.models.get("llm:latest")
llm_tokenizer = bentoml.models.get("llm_token:latest")


class pipeline(bentoml.Runnable):
    def __init__(self):
        self.tokenizer = bentoml.transformers.load_model(llm_tokenizer)
        self.llm = bentoml.transformers.load_model(llm)

    @bentoml.Runnable.method(batchable=False)
    def infer_pipeline(self, input):
        input = input + PROMPT
        tokens = self.tokenizer(input, return_tensors = "pt")
        temps = [0.1, 0.5, 0.9]
        outputs = {}
        for i in range(3):
            generation_config = GenerationConfig(
                temperature=temps[i],
                top_p=0.75,
                repetition_penalty=1.1,
            )
            response = self.llm.generate(
                    input_ids = tokens["input_ids"],
                    generation_config=generation_config,
                    return_dict_in_generate=True,
                )
            decoded_output = self.tokenizer.decode(response.sequences[0])
            outputs[f"paragraph{i}"] = decoded_output
        
        return outputs


llm_infer = bentoml.Runner(pipeline, name = "llm_runner", models=[llm_tokenizer, llm])
svc = bentoml.Service("fine-tuned-llm", runners=[llm_infer])


@svc.api(input=Text(), output=JSON())
async def generate_response(input: str) -> dict[str,str]:
    return await llm_infer.infer_pipeline.async_run(input)


