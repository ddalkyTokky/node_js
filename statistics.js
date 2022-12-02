const { PrismaClient: ReplicaClient } = require('./prisma/replicaClient/index.js');
const replicaClient = new ReplicaClient();

const { PrismaClient: StatisticsClient } = require('./prisma/statisticsClient/index.js');
const statisticsClient = new StatisticsClient();

const _ = require('lodash');


async function TGstatistics() {
    const startdate = new Date(2021,5,22);
    startdate.toDateString()
    console.log(startdate)

    //현재 날짜
    const today = new Date();
    today.toDateString();
    console.log(today)
    const getDates = await replicaClient.taskGroups.findMany({
        select: {
            createdAt: true,
        },
        orderBy: {
            createdAt: 'asc',
    
        },
    })
    
    for (let i = 0; i < getDates.length; i++){
        getDates[i].createdAt = JSON.stringify(getDates[i].createdAt).substring(1,11)
        //console.log(getDates[i].createdAt)
    }
    const uniqDates = _.uniqBy(getDates, 'createdAt');
    console.log(uniqDates)
    
    const countstatus = await replicaClient.taskGroups.findMany({
        select: {
            createdAt: true,
            status: true,
        },
        where: {
            createdAt: {
                lt: today,
                gte: startdate,
                
            },
            //status: 'ING',
        },
        orderBy: {
            createdAt: 'asc',
    
        },
    })
    
    
    
    for (let i = 0; i < countstatus.length; i++){
        countstatus[i].createdAt = JSON.stringify(countstatus[i].createdAt).substring(1,11)
        //console.log(getDates[i].createdAt)
    }
    console.log(countstatus)
    
    const UPLOADED = Array.from({length: uniqDates.length}, () => 0);
    const GENERATED = Array.from({length: uniqDates.length}, () => 0);
    const READY = Array.from({length: uniqDates.length}, () => 0);
    const CREATED = Array.from({length: uniqDates.length}, () => 0);
    
    let j =0;
    for (let i = 0; i < countstatus.length; i++) {
        if (countstatus[i].createdAt == uniqDates[j].createdAt) {
            if (countstatus[i].status == 'UPLOADED') {
                UPLOADED[j] = UPLOADED[j] + 1;
                console.log(countstatus[i])
                console.log(UPLOADED[j])
            }
            if (countstatus[i].status == 'READY') {
                READY[j] = READY[j] + 1;
                console.log(countstatus[i])
                console.log(READY[j])
                
            }
            if (countstatus[i].status == 'GENERATED') {
                GENERATED[j] = GENERATED[j] + 1;
                console.log(countstatus[i])
                console.log(GENERATED[j])
                
            }
            if (countstatus[i].status == 'CREATED') {
                CREATED[j] = CREATED[j] + 1;
                console.log(countstatus[i])
                console.log(CREATED[j])
                
            }
        }
        else {
            j = j + 1;
            if (countstatus[i].status == 'UPLOADED') {
                UPLOADED[j] = UPLOADED[j] + 1;
                console.log(countstatus[i])
                console.log(UPLOADED[j])
            }
            if (countstatus[i].status == 'READY') {
                READY[j] = READY[j] + 1;
                console.log(countstatus[i])
                console.log(READY[j])
                
            }
            if (countstatus[i].status == 'GENERATED') {
                GENERATED[j] = GENERATED[j] + 1;
                console.log(countstatus[i])
                console.log(GENERATED[j])
                
            }
            if (countstatus[i].status == 'CREATED') {
                CREATED[j] = CREATED[j] + 1;
                console.log(countstatus[i])
                console.log(CREATED[j])
                
            }
        }
    }
    
    console.log(UPLOADED)
    
    
    for (let i = 0; i < uniqDates.length; i++) {
        const insertdates = await statisticsClient.countTG.create({
            data: {
                createdAt:  uniqDates[i].createdAt,
                CREATED: CREATED[i],
                READY: READY[i],
                UPLOADED: UPLOADED[i],
                GENERATED: GENERATED[i],
                
            },
        })
    
    }

}

TGstatistics();