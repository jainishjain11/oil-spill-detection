from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras import layers, models

def build_model():
    base_model = MobileNetV2(weights='imagenet', include_top=False, input_shape=(224,224,3))

    base_model.trainable = False

    x = base_model.output
    x = layers.GlobalAveragePooling2D()(x)
    x = layers.Dense(128, activation='relu')(x)
    x = layers.Dropout(0.5)(x)
    output = layers.Dense(1, activation='sigmoid')(x)

    model = models.Model(inputs=base_model.input, outputs=output)

    model.compile(optimizer='adam', loss='binary_crossentropy', metrics=['accuracy'])

    return model