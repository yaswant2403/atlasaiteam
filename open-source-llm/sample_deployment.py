import torch
import bentoml
from fine_tune import parse_option

def load_model(model_dir):
    model = torch.load(model_dir)
    bento_model = bentoml.pytorch.save_model("llm", model)


if __name__ == "__main__":
    opt = parse_option()
    dir = opt.output_dir
    load_model(dir)
