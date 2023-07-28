import torch
import bentoml
from fine_tune import parse_option
from transformers import LlamaTokenizer

def load_model(model_dir, tokenizer_name):
    model = torch.load(model_dir)
    bento_model = bentoml.transformers.save_model("llm", model)
    if tokenizer_name== "llama_tokenizer":
        tokenizer =  LlamaTokenizer.from_pretrained('openlm-research/open_llama_7b_v2')
        tokenizer = bentoml.transformers.save_model("llm_token", tokenizer)
    else:
        raise RuntimeError("Tokenizer not implemented")



if __name__ == "__main__":
    opt = parse_option()
    dir = opt.output_dir
    tokenizer_name = opt.tokenizer
    load_model(dir, tokenizer_name)
