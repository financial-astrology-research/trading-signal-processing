# Serverless trading post processing

This project demonstrates how to receive and process Trading View signals for noise filtering or complementary indicators not supported in their platform and composition of the signaly to open positions with Zignaly trading bot.

**Deploy**

In order to deploy this function you will need a AWS account to host the lambda function. Once you deploy it a endpoint URL will be display in the console, this is the one you should use to post the Trading View strategy alerts to.

```
$ serverless login
$ serverless deploy
```
