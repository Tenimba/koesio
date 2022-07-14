                                Bonjour, 

Ce projet est une réponse à la problématique : 
"Développer une solution technique permettant à un utilisateur d'envoyer un message sur ses différents réseaux sociaux."


Ce projet est réalisé en NodeJS/Express back end et ReactJS en frontJs, car pour moi, c'étaient les meilleurs choix de techno pour le problème posé dans le sens ou NodeJs et Reactjs sont les plus adapte aux applications aux multiples communications en temps réel sans ralentissement.

La bd utilisée est du SQL sur un serveur Mariadb.


Il permet d'envoi en direct dans de messages dans Discord ou slack selon votre choix.
Elle garde une trace de tous vos envois que vous pourrez consulter dans la rubrique historique.


                            Allez plus loin 

de mon point de vue, il serai neccesaire dans un premier temps de cree une bd en ligne afin de stocker les infomations
comme actuellemnt realisez en local.

il serai egalement possible de trouver une methode pour genere les webhooks seul pour chaque serveur,
ainsi nous pourrions integret plus de serrveur comme facebook, whatshapp, instagram,linkedin et autre.
il existe des exemple commme Discohook qui mettrait sur une piste.


                            DIFFICULTER RENCONTRE

le deploiement en ligne est l'etape avec la quel j'ai rencontre le plus de difficulter, 
il a ete tres difficile pour moi de trouver comment faire un deploiement avec git hub ou git lab sur une page comprennent
un back en node js et un front en react.

j'ai egalement rencontre des difficulter sur la plannification des messages.

j'ai commencer par chercher comment regler lheure des envoi des requete sous socket.io mais socket 
etant un justement pour des gestions en temsp reel, cella n'est pas possible.
suite a lechec de cette tentative jai essayer de trouver comment je pouvais faire des reglage 
directement sur les webhooks.


