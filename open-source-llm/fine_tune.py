import torch 
import json
from torch.utils.data import Dataset
import transformers
from transformers import LlamaTokenizer, LlamaForCausalLM
import datasets
import os
import argparse

##----------------------------------------------------------------------------------
#This part is not used in the final implementation, it is kept in case of future use
##----------------------------------------------------------------------------------

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
##----------------------------------------------------------------------------------








##----------------------------------------------------------------------------------------------------
#Disclaimer: Since in the summer session the Openai api key and the server for training is not set up, 
# this pipeline is not fully tested.
##----------------------------------------------------------------------------------------------------

## The code is adapted from https://www.mlexpert.io/machine-learning/tutorials/alpaca-fine-tuning
## TODO: Implement other pre-trained model (MPT-7B)




# The training arguments to be parsed
# {"training_dir": the directory of the dataset used to train the model
#  "output_dir": the directory to store the model parameters
#  "train_epoch": train epoches
#  "batch": training batch size
#  "warmup": warmup steps
#  "weight_decay": weight decay
# }



def parse_option():
    parser = argparse.ArgumentParser('argument for training')
    parser.add_argument("--training_dir", type=str, help="the directory of the dataset used to train the model")
    parser.add_argument("--output_dir", type=str, help="the directory to store the model parameters")
    parser.add_argument("--train_epoch", type=int, default= 10, help = " train epoches")
    parser.add_argument("--batch", type=int, default = 100, help="training batch size")
    parser.add_argument("--warmup", type=int, default=0, help="warmup steps")
    parser.add_argument("--weight_decay", type = float, default=0.0001, help="weight decay")
    parser.add_argument("--tokenizer", type=str, default="llama_tokenizer", help="choose the appropriate tokenizer for you model")
    parser.add_argument("--model", type=str, default="llama", help="the mode to fine-tune")

    opt = parser.parse_args()
    assert opt.training_dir is not None, "No training directory"
    assert opt.output_dir is not None, "No ouput directory"

    return opt



#Create the prompt to be fed into the model
def generate_prompt(data_point):
      return f"""Below is a description of an intern in ATLAS internship program. Generate a spotlight paragraph using the description.  # noqa: E501
  ### Instruction:
  {data_point["instruction"]}
  ### Response:
  {data_point["output"]}"""
 
 
def tokenize(prompt, length = 500):
    opt = parse_option()
    if opt.tokenizer == "llana_tokenizer":
      tokenizer =  LlamaTokenizer.from_pretrained('openlm-research/open_llama_7b_v2')
      tokenizer.pad_token = tokenizer.eos_token
    else:
        raise RuntimeError("tokenizer not implemented")
    
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
    ):
        result["input_ids"].append(tokenizer.eos_token_id)
        result["attention_mask"].append(1)
 
    result["labels"] = result["input_ids"].copy()
 
    return result
 

def generate_and_tokenize_prompt(data_point):
    
    full_prompt = generate_prompt(data_point)
    tokenized_full_prompt = tokenize(full_prompt)
    return tokenized_full_prompt


def train(args):
    if(args.model == "llama" and args.tokenizer == "llama_tokenizer"):
        model_path = 'openlm-research/open_llama_7b_v2'
        tokenizer = LlamaTokenizer.from_pretrained(model_path)
        tokenizer.pad_token = tokenizer.eos_token
        model = LlamaForCausalLM.from_pretrained(
          model_path, torch_dtype=torch.float16, device_map='auto',
        )
    else:
        raise RuntimeError("Model not implemented")
    
    train_args = transformers.TrainingArguments(
      output_dir= args.output_dir,          
      num_train_epochs= args.train_epoch,              
      per_device_train_batch_size= args.batch,  
      warmup_steps= args.warmup,                
      weight_decay= args.weight_decay,  
      report_to= None            
    )

    data = datasets.load_dataset("json", data_files = args.training_dir)

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
    opt = parse_option()
    train(opt)

if __name__ == "__main__":
    main_()









