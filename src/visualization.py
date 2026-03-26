import matplotlib.pyplot as plt
import os
import seaborn as sns
from sklearn.metrics import confusion_matrix


def plot_metrics(report, accuracy, y_true, y_pred):
    # Ensure the output directory exists
    os.makedirs("outputs", exist_ok=True)

    # Extract values
    precision = [report['0']['precision'], report['1']['precision']]
    recall = [report['0']['recall'], report['1']['recall']]
    f1 = [report['0']['f1-score'], report['1']['f1-score']]
    classes = ['No Spill (0)', 'Oil Spill (1)']

    # Helper function
    def save_line_plot(x_data, y_data, title, filename, color='tab:blue'):
        plt.figure(figsize=(8, 5))
        plt.plot(x_data, y_data, marker='o', linestyle='-', linewidth=2, markersize=8, color=color)
        plt.title(title, fontsize=14, fontweight='bold')
        plt.ylim(0, 1.1)
        plt.grid(True, linestyle='--', alpha=0.7)
        plt.ylabel("Score")
        plt.savefig(f"outputs/{filename}")
        plt.close()

    # Graphs
    save_line_plot(['Accuracy'], [accuracy], "Model Accuracy", "accuracy.png", color='tab:green')
    save_line_plot(classes, precision, "Precision per Class", "precision.png", color='tab:blue')
    save_line_plot(classes, recall, "Recall per Class", "recall.png", color='tab:orange')
    save_line_plot(classes, f1, "F1 Score per Class", "f1_score.png", color='tab:red')

    print("📊 Metric graphs saved")


def plot_confusion_matrix(y_true, y_pred):

    os.makedirs("outputs", exist_ok=True)

    cm = confusion_matrix(y_true, y_pred)

    plt.figure(figsize=(6, 5))
    sns.heatmap(cm, annot=True, fmt='d', cmap='Blues')

    plt.title("Confusion Matrix", fontsize=14, fontweight='bold')
    plt.xlabel("Predicted")
    plt.ylabel("Actual")

    plt.savefig("outputs/confusion_matrix.png")
    plt.close()

    print("📊 Confusion matrix saved")