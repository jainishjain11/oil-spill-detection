from sklearn.metrics import classification_report, accuracy_score
import numpy as np
import os

def evaluate_model(model, val_gen):

    val_gen.reset()

    # Predictions
    preds = model.predict(val_gen)
    preds_binary = (preds > 0.5).astype(int).flatten()

    y_true = val_gen.classes

    print("\n📊 Transfer Learning Output:")

    print("Predicted classes:", np.unique(preds_binary))
    print("True classes:", np.unique(y_true))

    # Classification report
    report = classification_report(y_true, preds_binary, output_dict=True)
    print(classification_report(y_true, preds_binary))

    # Accuracy
    accuracy = accuracy_score(y_true, preds_binary)
    print(f"Accuracy: {accuracy:.4f}")

    # 🔥 Save results
    os.makedirs("outputs", exist_ok=True)

    with open("outputs/transfer_learning_results.txt", "w", encoding="utf-8") as f:
        f.write("Transfer Learning Output\n\n")
        f.write("Predicted classes: " + str(np.unique(preds_binary)) + "\n")
        f.write("True classes: " + str(np.unique(y_true)) + "\n\n")
        f.write(classification_report(y_true, preds_binary))
        f.write(f"\nAccuracy: {accuracy:.4f}\n")

    print("📁 Transfer results saved to outputs/transfer_learning_results.txt")

    return report, accuracy, y_true, preds_binary