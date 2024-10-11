from flask import Flask, request, jsonify
from flask_cors import CORS
import mysql.connector

app = Flask(__name__)

# Limiter l'accès aux domaines autorisés seulement
cors = CORS(app, resources={r"/api/*": {"origins": ["localhost", "http://localhost:63342"]}})


# Connexion à la base de données MySQL
def get_db_connector():
    return mysql.connector.connect(
        host="localhost",
        user="root",
        password="d72fe77191",
        database="wedding_fund"
    )


# Route pour recevoir les participations des utilisateurs
@app.route('/api/participate', methods=['POST'])
def participate():
    try:
        if not request.is_json:
            return jsonify({'error': 'Request body must be JSON'}), 400

        data = request.json
        name = data.get('name')
        email = data.get('email')
        message = data.get('message')
        participation = data.get('participation')
        project_id = data.get('projectId')
        payment_type = data.get('payment_type')

        if not all([name, email, participation, project_id, payment_type]):
            return jsonify({"error": "Missing required fields"}), 400

        valid_payment_types = ['Virement bancaire', 'Éspèces', 'Chèque']
        if payment_type not in valid_payment_types:
            return jsonify({"error": "Invalid payment type"}), 400

        connector = get_db_connector()
        cursor = connector.cursor()
        cursor.execute(
            """INSERT INTO participants (name, email, message, participation, projectId, payment_type) 
                        VALUES (%s, %s, %s, %s, %s, %s)""",
            (name, email, message, participation, project_id, payment_type)
        )
        connector.commit()

        # Mettre à jour le montant déjà donné dans le projet dans la table `projects`
        cursor.execute(
            "UPDATE projects SET donated = donated + %s WHERE id = %s",
            (participation, project_id)
        )
        connector.commit()

        return jsonify({'success': True, 'message': 'Participation enregistrée avec succès.'}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

    # Route pour créer un projet


@app.route('/api/projects', methods=['POST'])
def create_project():
    try:
        # Vérifie que la requête contient bien des données au format JSON
        if request.is_json:
            data = request.get_json()
        else:
            return jsonify({"error": "Request body must be JSON"}), 400

        # Récupération des données du projet depuis le JSON envoyé par le client
        title = data.get('title')
        description = data.get('description')
        image = data.get('image')
        donated = data.get('donated', 0)  # Valeur par défaut à 0 si non spécifié
        initialRotation = data.get('initialRotation', 0)  # Valeur par défaut à 0
        color = data.get('color')

        # Vérification des champs requis
        if not all([title, description, image, color]):
            return jsonify({"error": "Missing required fields"}), 400

        # Connexion à la base de données
        connector = get_db_connector()
        cursor = connector.cursor()

        # Requête SQL pour insérer un nouveau projet
        sql = """
        INSERT INTO projects (title, description, image, donated, initialRotation, color)
        VALUES (%s, %s, %s, %s, %s, %s)
        """
        cursor.execute(sql, (title, description, image, donated, initialRotation, color))

        # Confirme les changements dans la base de données
        connector.commit()

        # Fermer la connexion
        cursor.close()
        connector.close()

        return jsonify({"success": True, "message": "Project created successfully."}), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/projects', methods=['GET'])
def get_projects():
    try:
        conn = get_db_connector()
        cursor = conn.cursor(dictionary=True)  # Utilisation de dictionary=True pour obtenir des résultats sous forme de dictionnaire

        # Requête SQL pour sélectionner tous les projets
        cursor.execute("SELECT * FROM projects")
        projects = cursor.fetchall()  # Récupère tous les résultats

        cursor.close()
        conn.close()

        # Renvoie les projets sous forme de JSON
        return jsonify({"success": True, "projects": projects}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=4000)
