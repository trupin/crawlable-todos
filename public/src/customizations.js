/**
 * User: rupin_t
 * Date: 8/14/13
 * Time: 11:21 AM
 */

/**
 * Custom the template loading.
 * Each template is downloaded from the server and the cached.
 * @param filename
 */
Backbone.Marionette.TemplateCache.prototype.loadTemplate = function (filename) {
    var template = '';
    $.ajax('/templates/' + filename + '.html', { async: false }).done(function (data) {
        template = data;
    });
    return template;
};

/**
 * Custom the template rendering.
 * Use Solidify instead of _.template
 * @param rawTemplate
 * @returns {*}
 */
Backbone.Marionette.TemplateCache.prototype.compileTemplate = function (rawTemplate) {
    return Backbone.$.solidify(rawTemplate);
};