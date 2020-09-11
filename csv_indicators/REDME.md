# Signal buy / sell CSV indicators

Considering that platforms like Trading View has some limited capabilities on the trading indicators you can use and there is way to support machine learning algorithms one simple solution I considered is to generate a CSV file from daily or hourly cronjob (depending on your trading frequency) that can output time serie buy / sell rows indexed by Date.

For example a daily CSV trading indicator for EOSUSDT could be generated from this cronjob and output a EOSUSDT-daily.csv file with the following format:

| Date       | Action |
| ---------- | ------ |
| 2020-08-20 | buy    |
| 2020-08-21 | buy    |
| 2020-08-22 | sell   |
| 2020-08-23 | sell   |

Or in hour ly format a EOSUSDT-hourly.csv

| Date       | Hour | Action |
| ---------- | ---- | ------ |
| 2020-08-20 | 00   | buy    |
| 2020-08-20 | 01   | buy    |
| 2020-08-20 | 02   | buy    |
| 2020-08-21 | 12   | buy    |
| 2020-08-21 | 13   | buy    |

The indicators can be fetched by cronjob from any cloud storage like AWS S3 into this directory to be consumed by CSV filter function.
