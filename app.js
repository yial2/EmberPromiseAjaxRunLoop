window.App = Ember.Application.create({
    // Basic logging, e.g. "Transitioned into 'post'"
    LOG_TRANSITIONS: true,

    // Extremely detailed logging, highlighting every internal
    // step made while transitioning into a route, including
    // `beforeModel`, `model`, and `afterModel` hooks, and
    // information about redirects and aborted transitions
    //LOG_TRANSITIONS_INTERNAL: true,

    //view look up
    LOG_VIEW_LOOKUPS: true,
    rootElement: '#ember-app'
});

App.ajax = function (url, options) {
    return new Ember.RSVP.Promise(function (resolve, reject) {
        var callBackOptions = options || {};

        callBackOptions.success = function (data) {
            Ember.run(null, resolve, data);
        };

        callBackOptions.error = function (jqXHR, status, error) {
            var errorObj = {
                jqXHR: jqXHR,
                status: status,
                error: error
            };
            Ember.run(null, reject, errorObj);
        };

        Ember.$.ajax(url, callBackOptions);
    });
};

App.getJson = function (url, params) {
    return App.ajax(url, {
        type: "GET",
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        data: params
    });
};

App.postJson = function (url, data) {
    return App.ajax(url, {
        type: "POST",
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        data: JSON.stringify(data)
    })
}

App.putJson = function (url, data) {
    return App.ajax(url, {
        type: "PUT",
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        data: JSON.stringify(data)
    })
}


App.PendingPhaseIIRecord = Ember.Object.extend({
    revisionFormat: function () {
        var dtMoment = moment(this.get('revision', 'YYYY/MM/DD hh:mm:ss.SS A'));
        return dtMoment.format('MM/YYYY');
    }.property('revision'),
    createdDateTimeFormat: function () {
        var dtMoment = moment(this.get('createdDateTime', 'YYYY/MM/DD hh:mm:ss.SS A'));
        return dtMoment.format('MM/DD/YYYY');
    }.property('createdDateTime'),
    updatedDateTimeFormat: function () {
        var dtMoment = moment(this.get('updatedDateTime', 'YYYY/MM/DD hh:mm:ss.SS A'));
        return dtMoment.format('YYYY/MM/DD hh:mm:ss A');
    }.property('updatedDateTime')
});

App.Router.map(function () {
    // put your routes here
    //this.resource('index', { path: '/', queryParams: ['startDate', 'endDate'] });
});

App.IndexRoute = Ember.Route.extend({
    model: function (params) {
        return App.getJson('../WebApi/PendingPhaseIIs').then(function (response) {
            var records = Ember.A();
            response.forEach(function (item) {
                records.pushObject(App.PendingPhaseIIRecord.create(item));
            });
            return records;
        });
    }
});

App.IndexController = Ember.ArrayController.extend({
    actions: {
        send: function (record) {
            record.set('isSent', true);
            App.putJson('../WebApi/PendingPhaseIIs', record).then(function (response) {
                record.set('updatedDateTime', response.updatedDateTime);
            }).then(null, function(error){
                record.set('isSent', false);
                alert(error.jqXHR.responseText);
            });
        }
    }
});