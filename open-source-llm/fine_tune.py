import torch 
import json
from torch.utils.data import Dataset
import transformers
from transformers import LlamaTokenizer, LlamaForCausalLM
import datasets
import os

##--------------------------------------------------
#This part is not used in the final implementation, it is kept in case of future use
##--------------------------------------------------

# class InstDataset(Dataset):
#   def __init__(self, inst, output):
#     self.instruct = inst
#     self.output = output

#   def __len__(self):
#     return len(self.instruct)

#   def __getitem__(self, idx):
#     item = {key: torch.tensor(val[idx]) for key, val in self.instruct.items()}
#     item["labels"] = torch.tensor(self.output["input_ids"][idx])
#     return item
  
  
# def create_dataset(dir,tokenizer):
#   instruct = []
#   output = []

#   f = open(dir)
#   data = json.load(f)

#   for i in data:
#     if i["avg_similarity_score"] < 0.16:
#       continue
#     instruct.append(i["instruction"])
#     output.append(i["output"])

#   instruct = tokenizer(instruct,truncation = True, padding = True, return_tensors = 'pt', max_length = 400)
#   output = tokenizer(output, truncation = True, padding = True, return_tensors = 'pt', max_length = 400)

#   return InstDataset(instruct, output)



## The code is adapted from https://www.mlexpert.io/machine-learning/tutorials/alpaca-fine-tuning
## TODO: Implement other pre-trained model (MPT-7B);
##       Implement parsers and CML functions

def generate_prompt(data_point):
      return f"""Below is a description of an intern in ATLAS internship program. Generate a spotlight paragraph using the description.  # noqa: E501
  ### Instruction:
  {data_point["instruction"]}
  ### Response:
  {data_point["output"]}"""
 
 
def tokenize(prompt, length = 500, add_eos_token = False):
    tokenizer =  LlamaTokenizer.from_pretrained('openlm-research/open_llama_7b_v2')
    tokenizer.pad_token = tokenizer.eos_token
    result = tokenizer(
        prompt,
        truncation=True,
        max_length=length,
        padding=False,
        return_tensors=None,
    )
    if (
        result["input_ids"][-1] != tokenizer.eos_token_id
        and len(result["input_ids"]) < length
        and add_eos_token
    ):
        result["input_ids"].append(tokenizer.eos_token_id)
        result["attention_mask"].append(1)
 
    result["labels"] = result["input_ids"].copy()
 
    return result
 
def generate_and_tokenize_prompt(data_point):
    
    full_prompt = generate_prompt(data_point)
    tokenized_full_prompt = tokenize(full_prompt)
    return tokenized_full_prompt


def train(model, args, tokenizer):
    train_args = transformers.TrainingArguments(
      output_dir= args["output_dir"],          
      num_train_epochs=args["train_epoch"],              
      per_device_train_batch_size= args["batch"],  
      warmup_steps=args["warmup"],                
      weight_decay=args["weight_decay"],  
      report_to= None            
    )

    data = datasets.load_dataset("json", data_files = args["training_dir"])

    train_data = (data["train"].map(generate_and_tokenize_prompt))
    train_data.remove_columns("instruction")
    train_data.remove_columns("avg_similarity_score")
    train_data.remove_columns("output")

    data_collator = transformers.DataCollatorForSeq2Seq(
      tokenizer, pad_to_multiple_of=8, return_tensors="pt", padding=True
  )

    trainer = transformers.Trainer(
      model = model,
      args = train_args,
      train_dataset= train_data,
      data_collator=data_collator
    )
    trainer.train()


def main_():
    model_path = 'openlm-research/open_llama_7b_v2'
    tokenizer = LlamaTokenizer.from_pretrained(model_path)
    tokenizer.pad_token = tokenizer.eos_token
    model = LlamaForCausalLM.from_pretrained(
        model_path, torch_dtype=torch.float16, device_map='auto',
    )

    args = {
      "training_dir": "regen.json",
      "output_dir": "ckpt.pt",
      "train_epoch": 10,
      "batch": 32,
      "warmup": 100,
      "weight_decay":0.001
    }

    train(model, args, tokenizer)








