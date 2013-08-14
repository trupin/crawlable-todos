/**
 * User: rupin_t
 * Date: 8/14/13
 * Time: 11:20 AM
 */

var app = app || new Marionette.Application();

var User = Backbone.Model.extend({
    url: '/api/user'
});

var Todo = Backbone.Model.extend({
    rootUrl: '/api/todos'
});

var Todos = Backbone.Collection.extend({
    model: Todo,
    url: '/api/todos'
});

var TodoView = Marionette.ItemView.extend({
    tagName: 'div',
    className: 'row-fluid',
    template: 'todo',
    modelEvents: {
        'sync': 'render'
    },
    events: {
        'submit .undo-todo-form': 'onUndoTodoSubmit',
        'submit .do-todo-form': 'onDoTodoSubmit',
        'submit .delete-todo-form': 'onDeleteTodoSubmit'
    },
    onUndoTodoSubmit: function (e) {
        e.preventDefault();
        this.model.set('done', 0);
        this.model.save();
    },
    onDoTodoSubmit: function (e) {
        e.preventDefault();
        this.model.set('done', 1);
        this.model.save();
    },
    onDeleteTodoSubmit: function (e) {
        e.preventDefault();
        this.model.destroy();
    }
});

var TodosListView = Marionette.CompositeView.extend({
    template: 'todos',
    ui: {
        userForm: '#user-form',
        newTodoForm: '#new-todo-form',
        todoList: '#todo-list'
    },
    itemView: TodoView,
    modelEvents: {
        'sync': 'render'
    },
    collectionEvents: {
        'sync': 'render'
    },
    events: {
        'submit #user-form': 'onUserSubmit',
        'submit #new-todo-form': 'onNewTodoSubmit'
    },
    initialize: function () {
        this.model = new User();
        this.model.fetch();
        this.collection = new Todos();
        this.collection.fetch();
    },
    appendHtml: function (collectionView, itemView) {
        collectionView.ui.todoList.append(itemView.$el);
    },
    onUserSubmit: function (e) {
        e.preventDefault();
        this.model.set('name', this.ui.userForm.find('input[name=name]').val());
        this.model.save();
    },
    onNewTodoSubmit: function (e) {
        e.preventDefault();
        var todo = this.collection.create({
            task: this.ui.newTodoForm.find('input[name=task]').val()
        });
        this.collection.add(todo);
        this.ui.newTodoForm.find('input[name=task]').empty();
    }
});

app.addInitializer(function () {
    console.log('starting app.');

    registerHelpers(Handlebars, _);

    this.addRegions({ container: 'div.container-fluid' });

    this.container.show(new TodosListView());
});

$(document).ready(function () {

    $('#app').crawlable({
        context: '<div class="container-fluid"></div>'
    });

    app.start();

});


