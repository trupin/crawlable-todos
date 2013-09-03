/**
 * User: rupin_t
 * Date: 8/14/13
 * Time: 11:42 AM
 */

var registerHelpers = function (HandleBars, _, isCrawlable) {
    HandleBars.registerHelper('toggle', function () {
        return isCrawlable ? 'Try it with Javascript !' : 'Try it without Javascript !';
    });
};

var window = window || null;
if (!window) exports.register = registerHelpers;