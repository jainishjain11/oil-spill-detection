import numpy as np
import tensorflow as tf
import cv2
import matplotlib.pyplot as plt
import os


def get_img_array(img_path, size=(224, 224)):
    img = tf.keras.preprocessing.image.load_img(img_path, target_size=size)
    array = tf.keras.preprocessing.image.img_to_array(img)
    array = np.expand_dims(array, axis=0)
    return array / 255.0


def make_gradcam_heatmap(img_array, model, last_conv_layer_name):
    
    grad_model = tf.keras.models.Model(
        [model.inputs],
        [model.get_layer(last_conv_layer_name).output, model.output]
    )

    with tf.GradientTape() as tape:
        conv_outputs, predictions = grad_model(img_array)
        loss = predictions[:, 0]

    grads = tape.gradient(loss, conv_outputs)

    pooled_grads = tf.reduce_mean(grads, axis=(0, 1, 2))

    conv_outputs = conv_outputs[0]

    heatmap = conv_outputs @ pooled_grads[..., tf.newaxis]
    heatmap = tf.squeeze(heatmap)

    heatmap = np.maximum(heatmap, 0)
    heatmap = heatmap / (np.max(heatmap) + 1e-8)

    return heatmap


def save_and_display_gradcam(img_path, heatmap, output_path="outputs/gradcam.jpg", alpha=0.4):

    img = cv2.imread(img_path)
    img = cv2.resize(img, (224, 224))

    heatmap = cv2.resize(heatmap, (224, 224))
    heatmap = np.uint8(255 * heatmap)

    heatmap = cv2.applyColorMap(heatmap, cv2.COLORMAP_JET)

    superimposed_img = heatmap * alpha + img

    os.makedirs("outputs", exist_ok=True)
    cv2.imwrite(output_path, superimposed_img)

    plt.imshow(cv2.cvtColor(superimposed_img.astype("uint8"), cv2.COLOR_BGR2RGB))
    plt.axis('off')
    plt.title("Grad-CAM Heatmap")
    plt.show()

    print(f"📁 Grad-CAM saved to {output_path}")


def run_gradcam(model, img_path):

    print("\n Grad-CAM Visualization:")

    img_array = get_img_array(img_path)

    # MobileNetV2 last conv layer
    last_conv_layer_name = "Conv_1"

    heatmap = make_gradcam_heatmap(img_array, model, last_conv_layer_name)

    save_and_display_gradcam(img_path, heatmap)