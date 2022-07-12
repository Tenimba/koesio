Pour le back vous aurez besoin 

1."npm init"
2."npm i -s express"  
 Pour créer le dossier initial de node 
 
3. Crée un fichier.env a la racine de votre dossier et compléter le, avec les informations de connexion a votre bd SQL

4.Pour Slack : ajouter "WEBHOOK entrant" à votre serveur et copier sont URL dans SLACK_URL 

5. Pour discord dans les paramètres de votre serveur : dans "intégration" ajouter un webhook et copier sont URL dans DISCORD_URL

Votre fichier doit ressembler au fichier envexemple fourni

Une fois cela terminer

Il suffira de faire "node server.js"

Il devra ce lancer sur le port 8000. (ceci est important pour une bonne connexion avec le front.)
