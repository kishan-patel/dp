#!/usr/local/bin/python
from random import randint

dataFile = open('data.csv','w+')
for i in range(150):
    arm = randint(1,3)
    result = randint(0,1)
    dataFile.write(str(arm)+','+str(result)+'\n') 
dataFile.close()
  	
