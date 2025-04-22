import os
import argparse
import pandas as pd
import torch
import numpy as np
from torch.utils.data import Dataset
from transformers import (
    RobertaTokenizerFast,
    RobertaForSequenceClassification,
    DataCollatorWithPadding,
    get_linear_schedule_with_warmup,
    Trainer,
    TrainingArguments,
    pipeline,
)
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, precision_recall_fscore_support

class FinancialTextDataset(Dataset):
    def __init__(self, texts, labels, tokenizer, max_length):
        self.texts = texts.tolist()
        self.labels = labels.tolist()
        self.tokenizer = tokenizer
        self.max_length = max_length
    def __len__(self):
        return len(self.texts)
    def __getitem__(self, idx):
        enc = self.tokenizer(self.texts[idx], truncation=True, max_length=self.max_length, return_tensors="pt")
        item = {k: v.squeeze(0) for k, v in enc.items()}
        item["labels"] = torch.tensor(self.labels[idx], dtype=torch.long)
        return item

def compute_metrics(pred):
    labels = pred.label_ids
    preds = np.argmax(pred.predictions, axis=1)
    acc = accuracy_score(labels, preds)
    precision, recall, f1, _ = precision_recall_fscore_support(labels, preds, average="weighted")
    return {"accuracy": acc, "precision": precision, "recall": recall, "f1": f1}

def main():
    p = argparse.ArgumentParser()
    p.add_argument("--data_path", type=str, default="stock_data.csv")
    p.add_argument("--output_dir", type=str, default="roberta_financial_sentiment")
    p.add_argument("--model_name", type=str, default="roberta-base")
    p.add_argument("--max_length", type=int, default=128)
    p.add_argument("--batch_size", type=int, default=16)
    p.add_argument("--epochs", type=int, default=3)
    p.add_argument("--lr", type=float, default=2e-5)
    p.add_argument("--weight_decay", type=float, default=0.01)
    args = p.parse_args()

    df = pd.read_csv(args.data_path)
    train_df, test_df = train_test_split(df, test_size=0.1, stratify=df["label"], random_state=42)
    tokenizer = RobertaTokenizerFast.from_pretrained(args.model_name)
    train_ds = FinancialTextDataset(train_df["text"], train_df["label"], tokenizer, args.max_length)
    test_ds  = FinancialTextDataset(test_df["text"], test_df["label"], tokenizer, args.max_length)
    collator = DataCollatorWithPadding(tokenizer=tokenizer)
    model = RobertaForSequenceClassification.from_pretrained(args.model_name, num_labels=len(df["label"].unique()))
    training_args = TrainingArguments(
        output_dir=args.output_dir,
        evaluation_strategy="epoch",
        save_strategy="epoch",
        learning_rate=args.lr,
        per_device_train_batch_size=args.batch_size,
        per_device_eval_batch_size=args.batch_size,
        num_train_epochs=args.epochs,
        weight_decay=args.weight_decay,
        load_best_model_at_end=True,
        metric_for_best_model="f1",
        logging_dir=os.path.join(args.output_dir, "logs"),
        logging_steps=50,
        save_total_limit=2
    )
    trainer = Trainer(
        model=model,
        args=training_args,
        train_dataset=train_ds,
        eval_dataset=test_ds,
        tokenizer=tokenizer,
        data_collator=collator,
        compute_metrics=compute_metrics
    )
    trainer.train()
    trainer.save_model(args.output_dir)
    tokenizer.save_pretrained(args.output_dir)
    torch.save(model.state_dict(), os.path.join(args.output_dir, "pytorch_model.bin"))
    torch.save(training_args, os.path.join(args.output_dir, "training_args.bin"))
    sentiment = pipeline("sentiment-analysis", model=args.output_dir, tokenizer=args.output_dir, device=0 if torch.cuda.is_available() else -1)
    full_df = pd.read_csv(args.data_path)
    full_df["sentiment"] = full_df["text"].apply(lambda x: sentiment(x)[0]["label"])
    os.makedirs(args.output_dir, exist_ok=True)
    full_df.to_csv(os.path.join(args.output_dir, "stock_data_with_sentiment.csv"), index=False)

if __name__ == "__main__":
    main()
