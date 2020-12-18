import tensorflow as tf
import tensorflowjs as tfjs
from tensorflow import keras
"Dit deelt de data set op in een train en test set"
(train_img, train_label),(test_img,test_label) = keras.datasets.mnist.load_data()

"Dit past de schaal van de data aan zodat het makkelijker te verwerken is"
train_img = train_img.reshape([-1, 28, 28, 1])
test_img = test_img.reshape([-1, 28, 28, 1])
train_img = train_img/255.0
test_img = test_img/255.0

train_label = keras.utils.to_categorical(train_label)
test_label = keras.utils.to_categorical(test_label)

"Nu gaan we het Neural Network maken"

model = keras.Sequential([
    keras.layers.Conv2D(32, (5, 5), padding="same", input_shape=[28, 28, 1]),
    keras.layers.MaxPool2D((2,2)),
    keras.layers.Conv2D(64, (5, 5), padding="same"),
    keras.layers.MaxPool2D((2,2)),
    keras.layers.Flatten(),
    keras.layers.Dense(1024, activation='relu'),
    keras.layers.Dropout(0.2),
    keras.layers.Dense(10, activation='softmax')
])
model.compile(optimizer='adam', loss='categorical_crossentropy', metrics=['accuracy'])

"Train de model"

model.fit(train_img,train_label, validation_data=(test_img,test_label), epochs=10)
test_loss,test_acc = model.evaluate(test_img,test_label)
print('Test Accuracy:', test_acc)

tfjs.converters.save_keras_model(model, 'model')

