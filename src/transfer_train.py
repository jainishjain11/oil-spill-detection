from sklearn.utils.class_weight import compute_class_weight
import numpy as np

def train_model(model, train_gen, val_gen):

    # Calculate class weights
    class_weights = compute_class_weight(
        class_weight='balanced',
        classes=np.unique(train_gen.classes),
        y=train_gen.classes
    )

    class_weights = dict(enumerate(class_weights))

    print("Class Weights:", class_weights)

    # Train model
    history = model.fit(
        train_gen,
        validation_data=val_gen,
        epochs=10,
        class_weight=class_weights
    )

    # Save model
    model.save("models/oil_spill_mobilenetv2.h5")

    return history