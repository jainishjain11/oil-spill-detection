from tensorflow.keras.preprocessing.image import ImageDataGenerator

def get_data_generators(data_dir):

    datagen = ImageDataGenerator(
        rescale=1./255,
        validation_split=0.2
    )

    train_gen = datagen.flow_from_directory(
        data_dir,
        target_size=(224, 224),
        batch_size=32,
        class_mode='binary',
        subset='training',
        shuffle=True
    )

    val_gen = datagen.flow_from_directory(
        data_dir,
        target_size=(224, 224),
        batch_size=32,
        class_mode='binary',
        subset='validation',
        shuffle=False
    )

    print("\nDEBUG INFO:")
    print("Class indices:", train_gen.class_indices)
    print("Train samples:", train_gen.samples)
    print("Validation samples:", val_gen.samples)

    return train_gen, val_gen