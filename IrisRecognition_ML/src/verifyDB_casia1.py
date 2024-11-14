import os
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.svm import SVC
from sklearn.metrics import classification_report, accuracy_score
import pickle
from extractandenconding import extractFeature, matchingTemplate
from time import time
import argparse

def train_model(embeddings, labels):
    X = np.array(list(embeddings.values()))  # Convert embeddings to array
    y = np.array(labels)

    # Flatten if the data has more than 2 dimensions
    if X.ndim > 2:
        X = X.reshape(X.shape[0], -1)

    # Split the dataset into training and testing sets
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    # Train SVC
    model = SVC(kernel='linear', C=0.5, probability=True)
    model.fit(X_train, y_train)

    # Predict on training data and evaluate
    y_train_pred = model.predict(X_train)
    print("Training set evaluation:")
    print(classification_report(y_train, y_train_pred))
    print(f'Training Accuracy: {accuracy_score(y_train, y_train_pred):.2f}')

    # Predict on testing data and evaluate
    y_test_pred = model.predict(X_test)
    print("Testing set evaluation:")
    print(classification_report(y_test, y_test_pred))
    print(f'Testing Accuracy: {accuracy_score(y_test, y_test_pred):.2f}')

    return model
def load_embeddings(template_dir):
    with open(os.path.join(template_dir, "template_db.pkl"), 'rb') as f:
        return pickle.load(f)

def create_labels(embeddings):
    labels = [filename.split('_')[0] for filename in embeddings.keys()]  # Extract label from file names
    return labels

def main():
    # Argument parser
    parser = argparse.ArgumentParser(description="Train model or verify image against templates.")
    parser.add_argument("--template_dir", type=str, default="./templates/CASIA1/",
                        help="Path to the directory containing template files (default: ./templates/CASIA1/).")
    parser.add_argument("--mode", type=str, choices=['train', 'verify'], default='train',
                        help="Mode of operation: 'train' to train the model or 'verify' to match images.")
    parser.add_argument("--filename", type=str, required=False, 
                        help="Path to the image file to verify (required in verify mode).")
    parser.add_argument("--threshold", type=float, default=0.37,
                        help="Threshold for matching (default: 0.37).")
    args = parser.parse_args()

    image_dir = 'D:/Capstone/softaware/IrisRecognition_ML/src'  # Path where images are stored

    if args.mode == 'train':
        # Load embeddings and create labels
        embeddings = load_embeddings(args.template_dir)
        labels = create_labels(embeddings)

        print("Training model...")
        model = train_model(embeddings, labels)

        # Save the trained model
        with open(os.path.join(args.template_dir, "trained_model.pkl"), 'wb') as f:
            pickle.dump(model, f)
        print("Model trained and saved.")

    elif args.mode == 'verify':
        # Ensure filename is provided for verification
        if not args.filename:
            raise ValueError("You must provide a --filename to verify an image.")
        
        # Check if file exists and if not, try to find the correct filename in the directory
        if not os.path.isfile(args.filename):
            # Try to find a valid filename in the format 300_1_X.jpg
            possible_files = [f for f in os.listdir(image_dir) if f.startswith("300_1_") and f.endswith(".jpg")]
            if possible_files:
                args.filename = os.path.join(image_dir, possible_files[0])  # Pick the first available file
            else:
                raise FileNotFoundError(f"No matching files found in '{image_dir}'.")

        start = time()
        print(f'\nStarting verification for file: {args.filename}\n')

        try:
            # Extract features from the image file
            template, mask, _ = extractFeature(args.filename)

            # Load the trained model
            with open(os.path.join(args.template_dir, "trained_model.pkl"), 'rb') as f:
                model = pickle.load(f)

            # Make prediction using the model
            pred = model.predict(template.reshape(1, -1))
            print(f'Predicted class: {pred[0]}')

            # Match extracted features against templates
            result = matchingTemplate(template, mask, args.template_dir, args.threshold)
            if result == -1:
                print('\tNo registered sample found.')
            elif result == 0:
                print('\tNo sample found in the directory.')
            else:
                print(f'\tSamples found (in descending order of reliability):')
                #for res in result:
                 #   print(f"\t{res}")
                # Print the authentication success message if matches are found
                print("Iris authentication successful.")

        except Exception as e:
            print(f"An error occurred: {e}")

        end = time()
        print(f'\nTotal time: {end - start:.2f} seconds\n')

if __name__ == "__main__":
    main()
