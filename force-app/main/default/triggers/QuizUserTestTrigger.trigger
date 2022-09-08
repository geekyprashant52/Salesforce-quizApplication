trigger QuizUserTestTrigger on QuizUserTest__c (before insert) {
    if (trigger.isBefore)
    {
        if (trigger.isInsert)
        {
            QuizUserTestService.setQuizResult(trigger.new);
        }
    }
}