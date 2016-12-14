/* NUGET: BEGIN LICENSE TEXT
 *
 * Microsoft grants you the right to use these script files for the sole
 * purpose of either: (i) interacting through your browser with the Microsoft
 * website or online service, subject to the applicable licensing or use
 * terms; or (ii) using the files as included with a Microsoft product subject
 * to that product's license terms. Microsoft reserves all other rights to the
 * files not expressly granted by Microsoft, whether by implication, estoppel
 * or otherwise. Insofar as a script file is dual licensed under GPL,
 * Microsoft neither took the code under GPL nor distributes it thereunder but
 * under the terms set out in this paragraph. All notices and licenses
 * below are for informational purposes only.
 *
 * NUGET: END LICENSE TEXT */
/*!
 * jQuery Validation Plugin 1.11.1
 *
 * http://bassistance.de/jquery-plugins/jquery-plugin-validation/
 * http://docs.jquery.com/Plugins/Validation
 *
 * Copyright 2013 Jörn Zaefferer
 * Released under the MIT license:
 *   http://www.opensource.org/licenses/mit-license.php
 */

(function($) {

$.extend($.fn, {
	// http://docs.jquery.com/Plugins/Validation/validate
	validate: function( options ) {

		// if nothing is selected, return nothing; can't chain anyway
		if ( !this.length ) {
			if ( options && options.debug && window.console ) {
				console.warn( "Nothing selected, can't validate, returning nothing." );
			}
			return;
		}

		// check if a validator for this form was already created
		var validator = $.data( this[0], "validator" );
		if ( validator ) {
			return validator;
		}

		// Add novalidate tag if HTML5.
		this.attr( "novalidate", "novalidate" );

		validator = new $.validator( options, this[0] );
		$.data( this[0], "validator", validator );

		if ( validator.settings.onsubmit ) {

			this.validateDelegate( ":submit", "click", function( event ) {
				if ( validator.settings.submitHandler ) {
					validator.submitButton = event.target;
				}
				// allow suppressing validation by adding a cancel class to the submit button
				if ( $(event.target).hasClass("cancel") ) {
					validator.cancelSubmit = true;
				}

				// allow suppressing validation by adding the html5 formnovalidate attribute to the submit button
				if ( $(event.target).attr("formnovalidate") !== undefined ) {
					validator.cancelSubmit = true;
				}
			});

			// validate the form on submit
			this.submit( function( event ) {
				if ( validator.settings.debug ) {
					// prevent form submit to be able to see console output
					event.preventDefault();
				}
				function handle() {
					var hidden;
					if ( validator.settings.submitHandler ) {
						if ( validator.submitButton ) {
							// insert a hidden input as a replacement for the missing submit button
							hidden = $("<input type='hidden'/>").attr("name", validator.submitButton.name).val( $(validator.submitButton).val() ).appendTo(validator.currentForm);
						}
						validator.settings.submitHandler.call( validator, validator.currentForm, event );
						if ( validator.submitButton ) {
							// and clean up afterwards; thanks to no-block-scope, hidden can be referenced
							hidden.remove();
						}
						return false;
					}
					return true;
				}

				// prevent submit for invalid forms or custom submit handlers
				if ( validator.cancelSubmit ) {
					validator.cancelSubmit = false;
					return handle();
				}
				if ( validator.form() ) {
					if ( validator.pendingRequest ) {
						validator.formSubmitted = true;
						return false;
					}
					return handle();
				} else {
					validator.focusInvalid();
					return false;
				}
			});
		}

		return validator;
	},
	// http://docs.jquery.com/Plugins/Validation/valid
	valid: function() {
		if ( $(this[0]).is("form")) {
			return this.validate().form();
		} else {
			var valid = true;
			var validator = $(this[0].form).validate();
			this.each(function() {
				valid = valid && validator.element(this);
			});
			return valid;
		}
	},
	// attributes: space seperated list of attributes to retrieve and remove
	removeAttrs: function( attributes ) {
		var result = {},
			$element = this;
		$.each(attributes.split(/\s/), function( index, value ) {
			result[value] = $element.attr(value);
			$element.removeAttr(value);
		});
		return result;
	},
	// http://docs.jquery.com/Plugins/Validation/rules
	rules: function( command, argument ) {
		var element = this[0];

		if ( command ) {
			var settings = $.data(element.form, "validator").settings;
			var staticRules = settings.rules;
			var existingRules = $.validator.staticRules(element);
			switch(command) {
			case "add":
				$.extend(existingRules, $.validator.normalizeRule(argument));
				// remove messages from rules, but allow them to be set separetely
				delete existingRules.messages;
				staticRules[element.name] = existingRules;
				if ( argument.messages ) {
					settings.messages[element.name] = $.extend( settings.messages[element.name], argument.messages );
				}
				break;
			case "remove":
				if ( !argument ) {
					delete staticRules[element.name];
					return existingRules;
				}
				var filtered = {};
				$.each(argument.split(/\s/), function( index, method ) {
					filtered[method] = existingRules[method];
					delete existingRules[method];
				});
				return filtered;
			}
		}

		var data = $.validator.normalizeRules(
		$.extend(
			{},
			$.validator.classRules(element),
			$.validator.attributeRules(element),
			$.validator.dataRules(element),
			$.validator.staticRules(element)
		), element);

		// make sure required is at front
		if ( data.required ) {
			var param = data.required;
			delete data.required;
			data = $.extend({required: param}, data);
		}

		return data;
	}
});

// Custom selectors
$.extend($.expr[":"], {
	// http://docs.jquery.com/Plugins/Validation/blank
	blank: function( a ) { return !$.trim("" + $(a).val()); },
	// http://docs.jquery.com/Plugins/Validation/filled
	filled: function( a ) { return !!$.trim("" + $(a).val()); },
	// http://docs.jquery.com/Plugins/Validation/unchecked
	unchecked: function( a ) { return !$(a).prop("checked"); }
});

// constructor for validator
$.validator = function( options, form ) {
	this.settings = $.extend( true, {}, $.validator.defaults, options );
	this.currentForm = form;
	this.init();
};

$.validator.format = function( source, params ) {
	if ( arguments.length === 1 ) {
		return function() {
			var args = $.makeArray(arguments);
			args.unshift(source);
			return $.validator.format.apply( this, args );
		};
	}
	if ( arguments.length > 2 && params.constructor !== Array  ) {
		params = $.makeArray(arguments).slice(1);
	}
	if ( params.constructor !== Array ) {
		params = [ params ];
	}
	$.each(params, function( i, n ) {
		source = source.replace( new RegExp("\\{" + i + "\\}", "g"), function() {
			return n;
		});
	});
	return source;
};

$.extend($.validator, {

	defaults: {
		messages: {},
		groups: {},
		rules: {},
		errorClass: "error",
		validClass: "valid",
		errorElement: "label",
		focusInvalid: true,
		errorContainer: $([]),
		errorLabelContainer: $([]),
		onsubmit: true,
		ignore: ":hidden",
		ignoreTitle: false,
		onfocusin: function( element, event ) {
			this.lastActive = element;

			// hide error label and remove error class on focus if enabled
			if ( this.settings.focusCleanup && !this.blockFocusCleanup ) {
				if ( this.settings.unhighlight ) {
					this.settings.unhighlight.call( this, element, this.settings.errorClass, this.settings.validClass );
				}
				this.addWrapper(this.errorsFor(element)).hide();
			}
		},
		onfocusout: function( element, event ) {
			if ( !this.checkable(element) && (element.name in this.submitted || !this.optional(element)) ) {
				this.element(element);
			}
		},
		onkeyup: function( element, event ) {
			if ( event.which === 9 && this.elementValue(element) === "" ) {
				return;
			} else if ( element.name in this.submitted || element === this.lastElement ) {
				this.element(element);
			}
		},
		onclick: function( element, event ) {
			// click on selects, radiobuttons and checkboxes
			if ( element.name in this.submitted ) {
				this.element(element);
			}
			// or option elements, check parent select in that case
			else if ( element.parentNode.name in this.submitted ) {
				this.element(element.parentNode);
			}
		},
		highlight: function( element, errorClass, validClass ) {
			if ( element.type === "radio" ) {
				this.findByName(element.name).addClass(errorClass).removeClass(validClass);
			} else {
				$(element).addClass(errorClass).removeClass(validClass);
			}
		},
		unhighlight: function( element, errorClass, validClass ) {
			if ( element.type === "radio" ) {
				this.findByName(element.name).removeClass(errorClass).addClass(validClass);
			} else {
				$(element).removeClass(errorClass).addClass(validClass);
			}
		}
	},

	// http://docs.jquery.com/Plugins/Validation/Validator/setDefaults
	setDefaults: function( settings ) {
		$.extend( $.validator.defaults, settings );
	},

	messages: {
		required: "This field is required.",
		remote: "Please fix this field.",
		email: "Please enter a valid email address.",
		url: "Please enter a valid URL.",
		date: "Please enter a valid date.",
		dateISO: "Please enter a valid date (ISO).",
		number: "Please enter a valid number.",
		digits: "Please enter only digits.",
		creditcard: "Please enter a valid credit card number.",
		equalTo: "Please enter the same value again.",
		maxlength: $.validator.format("Please enter no more than {0} characters."),
		minlength: $.validator.format("Please enter at least {0} characters."),
		rangelength: $.validator.format("Please enter a value between {0} and {1} characters long."),
		range: $.validator.format("Please enter a value between {0} and {1}."),
		max: $.validator.format("Please enter a value less than or equal to {0}."),
		min: $.validator.format("Please enter a value greater than or equal to {0}.")
	},

	autoCreateRanges: false,

	prototype: {

		init: function() {
			this.labelContainer = $(this.settings.errorLabelContainer);
			this.errorContext = this.labelContainer.length && this.labelContainer || $(this.currentForm);
			this.containers = $(this.settings.errorContainer).add( this.settings.errorLabelContainer );
			this.submitted = {};
			this.valueCache = {};
			this.pendingRequest = 0;
			this.pending = {};
			this.invalid = {};
			this.reset();

			var groups = (this.groups = {});
			$.each(this.settings.groups, function( key, value ) {
				if ( typeof value === "string" ) {
					value = value.split(/\s/);
				}
				$.each(value, function( index, name ) {
					groups[name] = key;
				});
			});
			var rules = this.settings.rules;
			$.each(rules, function( key, value ) {
				rules[key] = $.validator.normalizeRule(value);
			});

			function delegate(event) {
				var validator = $.data(this[0].form, "validator"),
					eventType = "on" + event.type.replace(/^validate/, "");
				if ( validator.settings[eventType] ) {
					validator.settings[eventType].call(validator, this[0], event);
				}
			}
			$(this.currentForm)
				.validateDelegate(":text, [type='password'], [type='file'], select, textarea, " +
					"[type='number'], [type='search'] ,[type='tel'], [type='url'], " +
					"[type='email'], [type='datetime'], [type='date'], [type='month'], " +
					"[type='week'], [type='time'], [type='datetime-local'], " +
					"[type='range'], [type='color'] ",
					"focusin focusout keyup", delegate)
				.validateDelegate("[type='radio'], [type='checkbox'], select, option", "click", delegate);

			if ( this.settings.invalidHandler ) {
				$(this.currentForm).bind("invalid-form.validate", this.settings.invalidHandler);
			}
		},

		// http://docs.jquery.com/Plugins/Validation/Validator/form
		form: function() {
			this.checkForm();
			$.extend(this.submitted, this.errorMap);
			this.invalid = $.extend({}, this.errorMap);
			if ( !this.valid() ) {
				$(this.currentForm).triggerHandler("invalid-form", [this]);
			}
			this.showErrors();
			return this.valid();
		},

		checkForm: function() {
			this.prepareForm();
			for ( var i = 0, elements = (this.currentElements = this.elements()); elements[i]; i++ ) {
				this.check( elements[i] );
			}
			return this.valid();
		},

		// http://docs.jquery.com/Plugins/Validation/Validator/element
		element: function( element ) {
			element = this.validationTargetFor( this.clean( element ) );
			this.lastElement = element;
			this.prepareElement( element );
			this.currentElements = $(element);
			var result = this.check( element ) !== false;
			if ( result ) {
				delete this.invalid[element.name];
			} else {
				this.invalid[element.name] = true;
			}
			if ( !this.numberOfInvalids() ) {
				// Hide error containers on last error
				this.toHide = this.toHide.add( this.containers );
			}
			this.showErrors();
			return result;
		},

		// http://docs.jquery.com/Plugins/Validation/Validator/showErrors
		showErrors: function( errors ) {
			if ( errors ) {
				// add items to error list and map
				$.extend( this.errorMap, errors );
				this.errorList = [];
				for ( var name in errors ) {
					this.errorList.push({
						message: errors[name],
						element: this.findByName(name)[0]
					});
				}
				// remove items from success list
				this.successList = $.grep( this.successList, function( element ) {
					return !(element.name in errors);
				});
			}
			if ( this.settings.showErrors ) {
				this.settings.showErrors.call( this, this.errorMap, this.errorList );
			} else {
				this.defaultShowErrors();
			}
		},

		// http://docs.jquery.com/Plugins/Validation/Validator/resetForm
		resetForm: function() {
			if ( $.fn.resetForm ) {
				$(this.currentForm).resetForm();
			}
			this.submitted = {};
			this.lastElement = null;
			this.prepareForm();
			this.hideErrors();
			this.elements().removeClass( this.settings.errorClass ).removeData( "previousValue" );
		},

		numberOfInvalids: function() {
			return this.objectLength(this.invalid);
		},

		objectLength: function( obj ) {
			var count = 0;
			for ( var i in obj ) {
				count++;
			}
			return count;
		},

		hideErrors: function() {
			this.addWrapper( this.toHide ).hide();
		},

		valid: function() {
			return this.size() === 0;
		},

		size: function() {
			return this.errorList.length;
		},

		focusInvalid: function() {
			if ( this.settings.focusInvalid ) {
				try {
					$(this.findLastActive() || this.errorList.length && this.errorList[0].element || [])
					.filter(":visible")
					.focus()
					// manually trigger focusin event; without it, focusin handler isn't called, findLastActive won't have anything to find
					.trigger("focusin");
				} catch(e) {
					// ignore IE throwing errors when focusing hidden elements
				}
			}
		},

		findLastActive: function() {
			var lastActive = this.lastActive;
			return lastActive && $.grep(this.errorList, function( n ) {
				return n.element.name === lastActive.name;
			}).length === 1 && lastActive;
		},

		elements: function() {
			var validator = this,
				rulesCache = {};

			// select all valid inputs inside the form (no submit or reset buttons)
			return $(this.currentForm)
			.find("input, select, textarea")
			.not(":submit, :reset, :image, [disabled]")
			.not( this.settings.ignore )
			.filter(function() {
				if ( !this.name && validator.settings.debug && window.console ) {
					console.error( "%o has no name assigned", this);
				}

				// select only the first element for each name, and only those with rules specified
				if ( this.name in rulesCache || !validator.objectLength($(this).rules()) ) {
					return false;
				}

				rulesCache[this.name] = true;
				return true;
			});
		},

		clean: function( selector ) {
			return $(selector)[0];
		},

		errors: function() {
			var errorClass = this.settings.errorClass.replace(" ", ".");
			return $(this.settings.errorElement + "." + errorClass, this.errorContext);
		},

		reset: function() {
			this.successList = [];
			this.errorList = [];
			this.errorMap = {};
			this.toShow = $([]);
			this.toHide = $([]);
			this.currentElements = $([]);
		},

		prepareForm: function() {
			this.reset();
			this.toHide = this.errors().add( this.containers );
		},

		prepareElement: function( element ) {
			this.reset();
			this.toHide = this.errorsFor(element);
		},

		elementValue: function( element ) {
			var type = $(element).attr("type"),
				val = $(element).val();

			if ( type === "radio" || type === "checkbox" ) {
				return $("input[name='" + $(element).attr("name") + "']:checked").val();
			}

			if ( typeof val === "string" ) {
				return val.replace(/\r/g, "");
			}
			return val;
		},

		check: function( element ) {
			element = this.validationTargetFor( this.clean( element ) );

			var rules = $(element).rules();
			var dependencyMismatch = false;
			var val = this.elementValue(element);
			var result;

			for (var method in rules ) {
				var rule = { method: method, parameters: rules[method] };
				try {

					result = $.validator.methods[method].call( this, val, element, rule.parameters );

					// if a method indicates that the field is optional and therefore valid,
					// don't mark it as valid when there are no other rules
					if ( result === "dependency-mismatch" ) {
						dependencyMismatch = true;
						continue;
					}
					dependencyMismatch = false;

					if ( result === "pending" ) {
						this.toHide = this.toHide.not( this.errorsFor(element) );
						return;
					}

					if ( !result ) {
						this.formatAndAdd( element, rule );
						return false;
					}
				} catch(e) {
					if ( this.settings.debug && window.console ) {
						console.log( "Exception occurred when checking element " + element.id + ", check the '" + rule.method + "' method.", e );
					}
					throw e;
				}
			}
			if ( dependencyMismatch ) {
				return;
			}
			if ( this.objectLength(rules) ) {
				this.successList.push(element);
			}
			return true;
		},

		// return the custom message for the given element and validation method
		// specified in the element's HTML5 data attribute
		customDataMessage: function( element, method ) {
			return $(element).data("msg-" + method.toLowerCase()) || (element.attributes && $(element).attr("data-msg-" + method.toLowerCase()));
		},

		// return the custom message for the given element name and validation method
		customMessage: function( name, method ) {
			var m = this.settings.messages[name];
			return m && (m.constructor === String ? m : m[method]);
		},

		// return the first defined argument, allowing empty strings
		findDefined: function() {
			for(var i = 0; i < arguments.length; i++) {
				if ( arguments[i] !== undefined ) {
					return arguments[i];
				}
			}
			return undefined;
		},

		defaultMessage: function( element, method ) {
			return this.findDefined(
				this.customMessage( element.name, method ),
				this.customDataMessage( element, method ),
				// title is never undefined, so handle empty string as undefined
				!this.settings.ignoreTitle && element.title || undefined,
				$.validator.messages[method],
				"<strong>Warning: No message defined for " + element.name + "</strong>"
			);
		},

		formatAndAdd: function( element, rule ) {
			var message = this.defaultMessage( element, rule.method ),
				theregex = /\$?\{(\d+)\}/g;
			if ( typeof message === "function" ) {
				message = message.call(this, rule.parameters, element);
			} else if (theregex.test(message)) {
				message = $.validator.format(message.replace(theregex, "{$1}"), rule.parameters);
			}
			this.errorList.push({
				message: message,
				element: element
			});

			this.errorMap[element.name] = message;
			this.submitted[element.name] = message;
		},

		addWrapper: function( toToggle ) {
			if ( this.settings.wrapper ) {
				toToggle = toToggle.add( toToggle.parent( this.settings.wrapper ) );
			}
			return toToggle;
		},

		defaultShowErrors: function() {
			var i, elements;
			for ( i = 0; this.errorList[i]; i++ ) {
				var error = this.errorList[i];
				if ( this.settings.highlight ) {
					this.settings.highlight.call( this, error.element, this.settings.errorClass, this.settings.validClass );
				}
				this.showLabel( error.element, error.message );
			}
			if ( this.errorList.length ) {
				this.toShow = this.toShow.add( this.containers );
			}
			if ( this.settings.success ) {
				for ( i = 0; this.successList[i]; i++ ) {
					this.showLabel( this.successList[i] );
				}
			}
			if ( this.settings.unhighlight ) {
				for ( i = 0, elements = this.validElements(); elements[i]; i++ ) {
					this.settings.unhighlight.call( this, elements[i], this.settings.errorClass, this.settings.validClass );
				}
			}
			this.toHide = this.toHide.not( this.toShow );
			this.hideErrors();
			this.addWrapper( this.toShow ).show();
		},

		validElements: function() {
			return this.currentElements.not(this.invalidElements());
		},

		invalidElements: function() {
			return $(this.errorList).map(function() {
				return this.element;
			});
		},

		showLabel: function( element, message ) {
			var label = this.errorsFor( element );
			if ( label.length ) {
				// refresh error/success class
				label.removeClass( this.settings.validClass ).addClass( this.settings.errorClass );
				// replace message on existing label
				label.html(message);
			} else {
				// create label
				label = $("<" + this.settings.errorElement + ">")
					.attr("for", this.idOrName(element))
					.addClass(this.settings.errorClass)
					.html(message || "");
				if ( this.settings.wrapper ) {
					// make sure the element is visible, even in IE
					// actually showing the wrapped element is handled elsewhere
					label = label.hide().show().wrap("<" + this.settings.wrapper + "/>").parent();
				}
				if ( !this.labelContainer.append(label).length ) {
					if ( this.settings.errorPlacement ) {
						this.settings.errorPlacement(label, $(element) );
					} else {
						label.insertAfter(element);
					}
				}
			}
			if ( !message && this.settings.success ) {
				label.text("");
				if ( typeof this.settings.success === "string" ) {
					label.addClass( this.settings.success );
				} else {
					this.settings.success( label, element );
				}
			}
			this.toShow = this.toShow.add(label);
		},

		errorsFor: function( element ) {
			var name = this.idOrName(element);
			return this.errors().filter(function() {
				return $(this).attr("for") === name;
			});
		},

		idOrName: function( element ) {
			return this.groups[element.name] || (this.checkable(element) ? element.name : element.id || element.name);
		},

		validationTargetFor: function( element ) {
			// if radio/checkbox, validate first element in group instead
			if ( this.checkable(element) ) {
				element = this.findByName( element.name ).not(this.settings.ignore)[0];
			}
			return element;
		},

		checkable: function( element ) {
			return (/radio|checkbox/i).test(element.type);
		},

		findByName: function( name ) {
			return $(this.currentForm).find("[name='" + name + "']");
		},

		getLength: function( value, element ) {
			switch( element.nodeName.toLowerCase() ) {
			case "select":
				return $("option:selected", element).length;
			case "input":
				if ( this.checkable( element) ) {
					return this.findByName(element.name).filter(":checked").length;
				}
			}
			return value.length;
		},

		depend: function( param, element ) {
			return this.dependTypes[typeof param] ? this.dependTypes[typeof param](param, element) : true;
		},

		dependTypes: {
			"boolean": function( param, element ) {
				return param;
			},
			"string": function( param, element ) {
				return !!$(param, element.form).length;
			},
			"function": function( param, element ) {
				return param(element);
			}
		},

		optional: function( element ) {
			var val = this.elementValue(element);
			return !$.validator.methods.required.call(this, val, element) && "dependency-mismatch";
		},

		startRequest: function( element ) {
			if ( !this.pending[element.name] ) {
				this.pendingRequest++;
				this.pending[element.name] = true;
			}
		},

		stopRequest: function( element, valid ) {
			this.pendingRequest--;
			// sometimes synchronization fails, make sure pendingRequest is never < 0
			if ( this.pendingRequest < 0 ) {
				this.pendingRequest = 0;
			}
			delete this.pending[element.name];
			if ( valid && this.pendingRequest === 0 && this.formSubmitted && this.form() ) {
				$(this.currentForm).submit();
				this.formSubmitted = false;
			} else if (!valid && this.pendingRequest === 0 && this.formSubmitted) {
				$(this.currentForm).triggerHandler("invalid-form", [this]);
				this.formSubmitted = false;
			}
		},

		previousValue: function( element ) {
			return $.data(element, "previousValue") || $.data(element, "previousValue", {
				old: null,
				valid: true,
				message: this.defaultMessage( element, "remote" )
			});
		}

	},

	classRuleSettings: {
		required: {required: true},
		email: {email: true},
		url: {url: true},
		date: {date: true},
		dateISO: {dateISO: true},
		number: {number: true},
		digits: {digits: true},
		creditcard: {creditcard: true}
	},

	addClassRules: function( className, rules ) {
		if ( className.constructor === String ) {
			this.classRuleSettings[className] = rules;
		} else {
			$.extend(this.classRuleSettings, className);
		}
	},

	classRules: function( element ) {
		var rules = {};
		var classes = $(element).attr("class");
		if ( classes ) {
			$.each(classes.split(" "), function() {
				if ( this in $.validator.classRuleSettings ) {
					$.extend(rules, $.validator.classRuleSettings[this]);
				}
			});
		}
		return rules;
	},

	attributeRules: function( element ) {
		var rules = {};
		var $element = $(element);
		var type = $element[0].getAttribute("type");

		for (var method in $.validator.methods) {
			var value;

			// support for <input required> in both html5 and older browsers
			if ( method === "required" ) {
				value = $element.get(0).getAttribute(method);
				// Some browsers return an empty string for the required attribute
				// and non-HTML5 browsers might have required="" markup
				if ( value === "" ) {
					value = true;
				}
				// force non-HTML5 browsers to return bool
				value = !!value;
			} else {
				value = $element.attr(method);
			}

			// convert the value to a number for number inputs, and for text for backwards compability
			// allows type="date" and others to be compared as strings
			if ( /min|max/.test( method ) && ( type === null || /number|range|text/.test( type ) ) ) {
				value = Number(value);
			}

			if ( value ) {
				rules[method] = value;
			} else if ( type === method && type !== 'range' ) {
				// exception: the jquery validate 'range' method
				// does not test for the html5 'range' type
				rules[method] = true;
			}
		}

		// maxlength may be returned as -1, 2147483647 (IE) and 524288 (safari) for text inputs
		if ( rules.maxlength && /-1|2147483647|524288/.test(rules.maxlength) ) {
			delete rules.maxlength;
		}

		return rules;
	},

	dataRules: function( element ) {
		var method, value,
			rules = {}, $element = $(element);
		for (method in $.validator.methods) {
			value = $element.data("rule-" + method.toLowerCase());
			if ( value !== undefined ) {
				rules[method] = value;
			}
		}
		return rules;
	},

	staticRules: function( element ) {
		var rules = {};
		var validator = $.data(element.form, "validator");
		if ( validator.settings.rules ) {
			rules = $.validator.normalizeRule(validator.settings.rules[element.name]) || {};
		}
		return rules;
	},

	normalizeRules: function( rules, element ) {
		// handle dependency check
		$.each(rules, function( prop, val ) {
			// ignore rule when param is explicitly false, eg. required:false
			if ( val === false ) {
				delete rules[prop];
				return;
			}
			if ( val.param || val.depends ) {
				var keepRule = true;
				switch (typeof val.depends) {
				case "string":
					keepRule = !!$(val.depends, element.form).length;
					break;
				case "function":
					keepRule = val.depends.call(element, element);
					break;
				}
				if ( keepRule ) {
					rules[prop] = val.param !== undefined ? val.param : true;
				} else {
					delete rules[prop];
				}
			}
		});

		// evaluate parameters
		$.each(rules, function( rule, parameter ) {
			rules[rule] = $.isFunction(parameter) ? parameter(element) : parameter;
		});

		// clean number parameters
		$.each(['minlength', 'maxlength'], function() {
			if ( rules[this] ) {
				rules[this] = Number(rules[this]);
			}
		});
		$.each(['rangelength', 'range'], function() {
			var parts;
			if ( rules[this] ) {
				if ( $.isArray(rules[this]) ) {
					rules[this] = [Number(rules[this][0]), Number(rules[this][1])];
				} else if ( typeof rules[this] === "string" ) {
					parts = rules[this].split(/[\s,]+/);
					rules[this] = [Number(parts[0]), Number(parts[1])];
				}
			}
		});

		if ( $.validator.autoCreateRanges ) {
			// auto-create ranges
			if ( rules.min && rules.max ) {
				rules.range = [rules.min, rules.max];
				delete rules.min;
				delete rules.max;
			}
			if ( rules.minlength && rules.maxlength ) {
				rules.rangelength = [rules.minlength, rules.maxlength];
				delete rules.minlength;
				delete rules.maxlength;
			}
		}

		return rules;
	},

	// Converts a simple string to a {string: true} rule, e.g., "required" to {required:true}
	normalizeRule: function( data ) {
		if ( typeof data === "string" ) {
			var transformed = {};
			$.each(data.split(/\s/), function() {
				transformed[this] = true;
			});
			data = transformed;
		}
		return data;
	},

	// http://docs.jquery.com/Plugins/Validation/Validator/addMethod
	addMethod: function( name, method, message ) {
		$.validator.methods[name] = method;
		$.validator.messages[name] = message !== undefined ? message : $.validator.messages[name];
		if ( method.length < 3 ) {
			$.validator.addClassRules(name, $.validator.normalizeRule(name));
		}
	},

	methods: {

		// http://docs.jquery.com/Plugins/Validation/Methods/required
		required: function( value, element, param ) {
			// check if dependency is met
			if ( !this.depend(param, element) ) {
				return "dependency-mismatch";
			}
			if ( element.nodeName.toLowerCase() === "select" ) {
				// could be an array for select-multiple or a string, both are fine this way
				var val = $(element).val();
				return val && val.length > 0;
			}
			if ( this.checkable(element) ) {
				return this.getLength(value, element) > 0;
			}
			return $.trim(value).length > 0;
		},

		// http://docs.jquery.com/Plugins/Validation/Methods/email
		email: function( value, element ) {
			// contributed by Scott Gonzalez: http://projects.scottsplayground.com/email_address_validation/
			return this.optional(element) || /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))$/i.test(value);
		},

		// http://docs.jquery.com/Plugins/Validation/Methods/url
		url: function( value, element ) {
			// contributed by Scott Gonzalez: http://projects.scottsplayground.com/iri/
			return this.optional(element) || /^(https?|s?ftp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i.test(value);
		},

		// http://docs.jquery.com/Plugins/Validation/Methods/date
		date: function( value, element ) {
			return this.optional(element) || !/Invalid|NaN/.test(new Date(value).toString());
		},

		// http://docs.jquery.com/Plugins/Validation/Methods/dateISO
		dateISO: function( value, element ) {
			return this.optional(element) || /^\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2}$/.test(value);
		},

		// http://docs.jquery.com/Plugins/Validation/Methods/number
		number: function( value, element ) {
			return this.optional(element) || /^-?(?:\d+|\d{1,3}(?:,\d{3})+)?(?:\.\d+)?$/.test(value);
		},

		// http://docs.jquery.com/Plugins/Validation/Methods/digits
		digits: function( value, element ) {
			return this.optional(element) || /^\d+$/.test(value);
		},

		// http://docs.jquery.com/Plugins/Validation/Methods/creditcard
		// based on http://en.wikipedia.org/wiki/Luhn
		creditcard: function( value, element ) {
			if ( this.optional(element) ) {
				return "dependency-mismatch";
			}
			// accept only spaces, digits and dashes
			if ( /[^0-9 \-]+/.test(value) ) {
				return false;
			}
			var nCheck = 0,
				nDigit = 0,
				bEven = false;

			value = value.replace(/\D/g, "");

			for (var n = value.length - 1; n >= 0; n--) {
				var cDigit = value.charAt(n);
				nDigit = parseInt(cDigit, 10);
				if ( bEven ) {
					if ( (nDigit *= 2) > 9 ) {
						nDigit -= 9;
					}
				}
				nCheck += nDigit;
				bEven = !bEven;
			}

			return (nCheck % 10) === 0;
		},

		// http://docs.jquery.com/Plugins/Validation/Methods/minlength
		minlength: function( value, element, param ) {
			var length = $.isArray( value ) ? value.length : this.getLength($.trim(value), element);
			return this.optional(element) || length >= param;
		},

		// http://docs.jquery.com/Plugins/Validation/Methods/maxlength
		maxlength: function( value, element, param ) {
			var length = $.isArray( value ) ? value.length : this.getLength($.trim(value), element);
			return this.optional(element) || length <= param;
		},

		// http://docs.jquery.com/Plugins/Validation/Methods/rangelength
		rangelength: function( value, element, param ) {
			var length = $.isArray( value ) ? value.length : this.getLength($.trim(value), element);
			return this.optional(element) || ( length >= param[0] && length <= param[1] );
		},

		// http://docs.jquery.com/Plugins/Validation/Methods/min
		min: function( value, element, param ) {
			return this.optional(element) || value >= param;
		},

		// http://docs.jquery.com/Plugins/Validation/Methods/max
		max: function( value, element, param ) {
			return this.optional(element) || value <= param;
		},

		// http://docs.jquery.com/Plugins/Validation/Methods/range
		range: function( value, element, param ) {
			return this.optional(element) || ( value >= param[0] && value <= param[1] );
		},

		// http://docs.jquery.com/Plugins/Validation/Methods/equalTo
		equalTo: function( value, element, param ) {
			// bind to the blur event of the target in order to revalidate whenever the target field is updated
			// TODO find a way to bind the event just once, avoiding the unbind-rebind overhead
			var target = $(param);
			if ( this.settings.onfocusout ) {
				target.unbind(".validate-equalTo").bind("blur.validate-equalTo", function() {
					$(element).valid();
				});
			}
			return value === target.val();
		},

		// http://docs.jquery.com/Plugins/Validation/Methods/remote
		remote: function( value, element, param ) {
			if ( this.optional(element) ) {
				return "dependency-mismatch";
			}

			var previous = this.previousValue(element);
			if (!this.settings.messages[element.name] ) {
				this.settings.messages[element.name] = {};
			}
			previous.originalMessage = this.settings.messages[element.name].remote;
			this.settings.messages[element.name].remote = previous.message;

			param = typeof param === "string" && {url:param} || param;

			if ( previous.old === value ) {
				return previous.valid;
			}

			previous.old = value;
			var validator = this;
			this.startRequest(element);
			var data = {};
			data[element.name] = value;
			$.ajax($.extend(true, {
				url: param,
				mode: "abort",
				port: "validate" + element.name,
				dataType: "json",
				data: data,
				success: function( response ) {
					validator.settings.messages[element.name].remote = previous.originalMessage;
					var valid = response === true || response === "true";
					if ( valid ) {
						var submitted = validator.formSubmitted;
						validator.prepareElement(element);
						validator.formSubmitted = submitted;
						validator.successList.push(element);
						delete validator.invalid[element.name];
						validator.showErrors();
					} else {
						var errors = {};
						var message = response || validator.defaultMessage( element, "remote" );
						errors[element.name] = previous.message = $.isFunction(message) ? message(value) : message;
						validator.invalid[element.name] = true;
						validator.showErrors(errors);
					}
					previous.valid = valid;
					validator.stopRequest(element, valid);
				}
			}, param));
			return "pending";
		}

	}

});

// deprecated, use $.validator.format instead
$.format = $.validator.format;

}(jQuery));

// ajax mode: abort
// usage: $.ajax({ mode: "abort"[, port: "uniqueport"]});
// if mode:"abort" is used, the previous request on that port (port can be undefined) is aborted via XMLHttpRequest.abort()
(function($) {
	var pendingRequests = {};
	// Use a prefilter if available (1.5+)
	if ( $.ajaxPrefilter ) {
		$.ajaxPrefilter(function( settings, _, xhr ) {
			var port = settings.port;
			if ( settings.mode === "abort" ) {
				if ( pendingRequests[port] ) {
					pendingRequests[port].abort();
				}
				pendingRequests[port] = xhr;
			}
		});
	} else {
		// Proxy ajax
		var ajax = $.ajax;
		$.ajax = function( settings ) {
			var mode = ( "mode" in settings ? settings : $.ajaxSettings ).mode,
				port = ( "port" in settings ? settings : $.ajaxSettings ).port;
			if ( mode === "abort" ) {
				if ( pendingRequests[port] ) {
					pendingRequests[port].abort();
				}
				pendingRequests[port] = ajax.apply(this, arguments);
				return pendingRequests[port];
			}
			return ajax.apply(this, arguments);
		};
	}
}(jQuery));

// provides delegate(type: String, delegate: Selector, handler: Callback) plugin for easier event delegation
// handler is only called when $(event.target).is(delegate), in the scope of the jquery-object for event.target
(function($) {
	$.extend($.fn, {
		validateDelegate: function( delegate, type, handler ) {
			return this.bind(type, function( event ) {
				var target = $(event.target);
				if ( target.is(delegate) ) {
					return handler.apply(target, arguments);
				}
			});
		}
	});
}(jQuery));

// SIG // Begin signature block
// SIG // MIIaswYJKoZIhvcNAQcCoIIapDCCGqACAQExCzAJBgUr
// SIG // DgMCGgUAMGcGCisGAQQBgjcCAQSgWTBXMDIGCisGAQQB
// SIG // gjcCAR4wJAIBAQQQEODJBs441BGiowAQS9NQkAIBAAIB
// SIG // AAIBAAIBAAIBADAhMAkGBSsOAwIaBQAEFOXlrZ3EtIg4
// SIG // 89Cu08Q+ym79w+b7oIIVejCCBLswggOjoAMCAQICEzMA
// SIG // AABZ1nPNUY7wIsUAAAAAAFkwDQYJKoZIhvcNAQEFBQAw
// SIG // dzELMAkGA1UEBhMCVVMxEzARBgNVBAgTCldhc2hpbmd0
// SIG // b24xEDAOBgNVBAcTB1JlZG1vbmQxHjAcBgNVBAoTFU1p
// SIG // Y3Jvc29mdCBDb3Jwb3JhdGlvbjEhMB8GA1UEAxMYTWlj
// SIG // cm9zb2Z0IFRpbWUtU3RhbXAgUENBMB4XDTE0MDUyMzE3
// SIG // MTMxNVoXDTE1MDgyMzE3MTMxNVowgasxCzAJBgNVBAYT
// SIG // AlVTMQswCQYDVQQIEwJXQTEQMA4GA1UEBxMHUmVkbW9u
// SIG // ZDEeMBwGA1UEChMVTWljcm9zb2Z0IENvcnBvcmF0aW9u
// SIG // MQ0wCwYDVQQLEwRNT1BSMScwJQYDVQQLEx5uQ2lwaGVy
// SIG // IERTRSBFU046RjUyOC0zNzc3LThBNzYxJTAjBgNVBAMT
// SIG // HE1pY3Jvc29mdCBUaW1lLVN0YW1wIFNlcnZpY2UwggEi
// SIG // MA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQDGbE7P
// SIG // aFP974De6IvEsfB+B84ePOwMjDWHTOlROry2sJZ3Qvr/
// SIG // PM/h2uKJ+m5CAJlbFt0JZDjiUvvfjvqToz27h49uuIfJ
// SIG // 0GBPz5yCkW2RG3IQs9hDfFlKYF3GsFXQJ9vy9r3yIMYi
// SIG // LJ5riy1s6ngEyUvBcAnnth2vmowGP3hw+nbu0iQUdrKu
// SIG // ICiDHKnwSJI/ooX3g8rFUdCVIAN50le8E7VOuLRsVh9T
// SIG // HhW7zzA//TsBzV9yaPfK85lmM6hdIo8dbsraZdIrHCSs
// SIG // n3ypEIqF4m0uXEr9Sbl7QLFTxt9HubMjTiJHHNPBuUl2
// SIG // QnLOkIYOJPXCPLkJNj+oU1xW/l9hAgMBAAGjggEJMIIB
// SIG // BTAdBgNVHQ4EFgQUWygas811DWM9/Zn1mxUCSBrLpqww
// SIG // HwYDVR0jBBgwFoAUIzT42VJGcArtQPt2+7MrsMM1sw8w
// SIG // VAYDVR0fBE0wSzBJoEegRYZDaHR0cDovL2NybC5taWNy
// SIG // b3NvZnQuY29tL3BraS9jcmwvcHJvZHVjdHMvTWljcm9z
// SIG // b2Z0VGltZVN0YW1wUENBLmNybDBYBggrBgEFBQcBAQRM
// SIG // MEowSAYIKwYBBQUHMAKGPGh0dHA6Ly93d3cubWljcm9z
// SIG // b2Z0LmNvbS9wa2kvY2VydHMvTWljcm9zb2Z0VGltZVN0
// SIG // YW1wUENBLmNydDATBgNVHSUEDDAKBggrBgEFBQcDCDAN
// SIG // BgkqhkiG9w0BAQUFAAOCAQEAevAN9EVsNJYOd/DiwEIF
// SIG // YfeI03r9iNWn9fd/8gj21f3LynR82wmp39YVB5m/0D6H
// SIG // hGJ7wgaOyoto4j3fnlrFjLKpXP5ZYib11/l4tm60CpBl
// SIG // ZulRCPF8yaO3BDdGxeeCPihc709xpOexJVrlQ1QzCH+k
// SIG // sFUt0YJwSBEgDSaBDu8GJXSrhcPDjOIUX+gFVI+6homq
// SIG // lq6UYiX5r2mICgyxUcQJ77iAfFOQebvpj9BI8GLImfFl
// SIG // NDv3zrX7Zpi5olmZXT6VnxS/NbT7mHIkKQzzugR6gjn7
// SIG // Rs3x4LIWvH0g+Jw5FSWhJi3Wi4G9xr2wnVT+RwtfLU4q
// SIG // 9IfqtQ+1t+2SKTCCBOwwggPUoAMCAQICEzMAAADKbNUy
// SIG // EjXE4VUAAQAAAMowDQYJKoZIhvcNAQEFBQAweTELMAkG
// SIG // A1UEBhMCVVMxEzARBgNVBAgTCldhc2hpbmd0b24xEDAO
// SIG // BgNVBAcTB1JlZG1vbmQxHjAcBgNVBAoTFU1pY3Jvc29m
// SIG // dCBDb3Jwb3JhdGlvbjEjMCEGA1UEAxMaTWljcm9zb2Z0
// SIG // IENvZGUgU2lnbmluZyBQQ0EwHhcNMTQwNDIyMTczOTAw
// SIG // WhcNMTUwNzIyMTczOTAwWjCBgzELMAkGA1UEBhMCVVMx
// SIG // EzARBgNVBAgTCldhc2hpbmd0b24xEDAOBgNVBAcTB1Jl
// SIG // ZG1vbmQxHjAcBgNVBAoTFU1pY3Jvc29mdCBDb3Jwb3Jh
// SIG // dGlvbjENMAsGA1UECxMETU9QUjEeMBwGA1UEAxMVTWlj
// SIG // cm9zb2Z0IENvcnBvcmF0aW9uMIIBIjANBgkqhkiG9w0B
// SIG // AQEFAAOCAQ8AMIIBCgKCAQEAlnFd7QZG+oTLnVu3Rsew
// SIG // 4bQROQOtsRVzYJzrp7ZuGjw//2XjNPGmpSFeVplsWOSS
// SIG // oQpcwtPcUi8MZZogYUBTMZxsjyF9uvn+E1BSYJU6W7lY
// SIG // pXRhQamU4K0mTkyhl3BJJ158Z8pPHnGERrwdS7biD8XG
// SIG // J8kH5noKpRcAGUxwRTgtgbRQqsVn0fp5vMXMoXKb9CU0
// SIG // mPhU3xI5OBIvpGulmn7HYtHcz+09NPi53zUwuux5Mqnh
// SIG // qaxVTUx/TFbDEwt28Qf5zEes+4jVUqUeKPo9Lc/PhJiG
// SIG // cWURz4XJCUSG4W/nsfysQESlqYsjP4JJndWWWVATWRhz
// SIG // /0MMrSvUfzBAZwIDAQABo4IBYDCCAVwwEwYDVR0lBAww
// SIG // CgYIKwYBBQUHAwMwHQYDVR0OBBYEFB9e4l1QjVaGvko8
// SIG // zwTop4e1y7+DMFEGA1UdEQRKMEikRjBEMQ0wCwYDVQQL
// SIG // EwRNT1BSMTMwMQYDVQQFEyozMTU5NStiNDIxOGYxMy02
// SIG // ZmNhLTQ5MGYtOWM0Ny0zZmM1NTdkZmM0NDAwHwYDVR0j
// SIG // BBgwFoAUyxHoytK0FlgByTcuMxYWuUyaCh8wVgYDVR0f
// SIG // BE8wTTBLoEmgR4ZFaHR0cDovL2NybC5taWNyb3NvZnQu
// SIG // Y29tL3BraS9jcmwvcHJvZHVjdHMvTWljQ29kU2lnUENB
// SIG // XzA4LTMxLTIwMTAuY3JsMFoGCCsGAQUFBwEBBE4wTDBK
// SIG // BggrBgEFBQcwAoY+aHR0cDovL3d3dy5taWNyb3NvZnQu
// SIG // Y29tL3BraS9jZXJ0cy9NaWNDb2RTaWdQQ0FfMDgtMzEt
// SIG // MjAxMC5jcnQwDQYJKoZIhvcNAQEFBQADggEBAHdc69eR
// SIG // Pc29e4PZhamwQ51zfBfJD+0228e1LBte+1QFOoNxQIEJ
// SIG // ordxJl7WfbZsO8mqX10DGCodJ34H6cVlH7XPDbdUxyg4
// SIG // Wojne8EZtlYyuuLMy5Pbr24PXUT11LDvG9VOwa8O7yCb
// SIG // 8uH+J13oxf9h9hnSKAoind/NcIKeGHLYI8x6LEPu/+rA
// SIG // 4OYdqp6XMwBSbwe404hs3qQGNafCU4ZlEXcJjzVZudiG
// SIG // qAD++DF9LPSMBZ3AwdV3cmzpTVkmg/HCsohXkzUAfFAr
// SIG // vFn8/hwpOILT3lKXRSkYTpZbnbpfG6PxJ1DqB5XobTQN
// SIG // OFfcNyg1lTo4nNTtaoVdDiIRXnswggW8MIIDpKADAgEC
// SIG // AgphMyYaAAAAAAAxMA0GCSqGSIb3DQEBBQUAMF8xEzAR
// SIG // BgoJkiaJk/IsZAEZFgNjb20xGTAXBgoJkiaJk/IsZAEZ
// SIG // FgltaWNyb3NvZnQxLTArBgNVBAMTJE1pY3Jvc29mdCBS
// SIG // b290IENlcnRpZmljYXRlIEF1dGhvcml0eTAeFw0xMDA4
// SIG // MzEyMjE5MzJaFw0yMDA4MzEyMjI5MzJaMHkxCzAJBgNV
// SIG // BAYTAlVTMRMwEQYDVQQIEwpXYXNoaW5ndG9uMRAwDgYD
// SIG // VQQHEwdSZWRtb25kMR4wHAYDVQQKExVNaWNyb3NvZnQg
// SIG // Q29ycG9yYXRpb24xIzAhBgNVBAMTGk1pY3Jvc29mdCBD
// SIG // b2RlIFNpZ25pbmcgUENBMIIBIjANBgkqhkiG9w0BAQEF
// SIG // AAOCAQ8AMIIBCgKCAQEAsnJZXBkwZL8dmmAgIEKZdlNs
// SIG // PhvWb8zL8epr/pcWEODfOnSDGrcvoDLs/97CQk4j1XIA
// SIG // 2zVXConKriBJ9PBorE1LjaW9eUtxm0cH2v0l3511iM+q
// SIG // c0R/14Hb873yNqTJXEXcr6094CholxqnpXJzVvEXlOT9
// SIG // NZRyoNZ2Xx53RYOFOBbQc1sFumdSjaWyaS/aGQv+knQp
// SIG // 4nYvVN0UMFn40o1i/cvJX0YxULknE+RAMM9yKRAoIsc3
// SIG // Tj2gMj2QzaE4BoVcTlaCKCoFMrdL109j59ItYvFFPees
// SIG // CAD2RqGe0VuMJlPoeqpK8kbPNzw4nrR3XKUXno3LEY9W
// SIG // PMGsCV8D0wIDAQABo4IBXjCCAVowDwYDVR0TAQH/BAUw
// SIG // AwEB/zAdBgNVHQ4EFgQUyxHoytK0FlgByTcuMxYWuUya
// SIG // Ch8wCwYDVR0PBAQDAgGGMBIGCSsGAQQBgjcVAQQFAgMB
// SIG // AAEwIwYJKwYBBAGCNxUCBBYEFP3RMU7TJoqV4ZhgO6gx
// SIG // b6Y8vNgtMBkGCSsGAQQBgjcUAgQMHgoAUwB1AGIAQwBB
// SIG // MB8GA1UdIwQYMBaAFA6sgmBAVieX5SUT/CrhClOVWeSk
// SIG // MFAGA1UdHwRJMEcwRaBDoEGGP2h0dHA6Ly9jcmwubWlj
// SIG // cm9zb2Z0LmNvbS9wa2kvY3JsL3Byb2R1Y3RzL21pY3Jv
// SIG // c29mdHJvb3RjZXJ0LmNybDBUBggrBgEFBQcBAQRIMEYw
// SIG // RAYIKwYBBQUHMAKGOGh0dHA6Ly93d3cubWljcm9zb2Z0
// SIG // LmNvbS9wa2kvY2VydHMvTWljcm9zb2Z0Um9vdENlcnQu
// SIG // Y3J0MA0GCSqGSIb3DQEBBQUAA4ICAQBZOT5/Jkav629A
// SIG // sTK1ausOL26oSffrX3XtTDst10OtC/7L6S0xoyPMfFCY
// SIG // gCFdrD0vTLqiqFac43C7uLT4ebVJcvc+6kF/yuEMF2nL
// SIG // pZwgLfoLUMRWzS3jStK8cOeoDaIDpVbguIpLV/KVQpzx
// SIG // 8+/u44YfNDy4VprwUyOFKqSCHJPilAcd8uJO+IyhyugT
// SIG // pZFOyBvSj3KVKnFtmxr4HPBT1mfMIv9cHc2ijL0nsnlj
// SIG // VkSiUc356aNYVt2bAkVEL1/02q7UgjJu/KSVE+Traeep
// SIG // oiy+yCsQDmWOmdv1ovoSJgllOJTxeh9Ku9HhVujQeJYY
// SIG // XMk1Fl/dkx1Jji2+rTREHO4QFRoAXd01WyHOmMcJ7oUO
// SIG // jE9tDhNOPXwpSJxy0fNsysHscKNXkld9lI2gG0gDWvfP
// SIG // o2cKdKU27S0vF8jmcjcS9G+xPGeC+VKyjTMWZR4Oit0Q
// SIG // 3mT0b85G1NMX6XnEBLTT+yzfH4qerAr7EydAreT54al/
// SIG // RrsHYEdlYEBOsELsTu2zdnnYCjQJbRyAMR/iDlTd5aH7
// SIG // 5UcQrWSY/1AWLny/BSF64pVBJ2nDk4+VyY3YmyGuDVyc
// SIG // 8KKuhmiDDGotu3ZrAB2WrfIWe/YWgyS5iM9qqEcxL5rc
// SIG // 43E91wB+YkfRzojJuBj6DnKNwaM9rwJAav9pm5biEKgQ
// SIG // tDdQCNbDPTCCBgcwggPvoAMCAQICCmEWaDQAAAAAABww
// SIG // DQYJKoZIhvcNAQEFBQAwXzETMBEGCgmSJomT8ixkARkW
// SIG // A2NvbTEZMBcGCgmSJomT8ixkARkWCW1pY3Jvc29mdDEt
// SIG // MCsGA1UEAxMkTWljcm9zb2Z0IFJvb3QgQ2VydGlmaWNh
// SIG // dGUgQXV0aG9yaXR5MB4XDTA3MDQwMzEyNTMwOVoXDTIx
// SIG // MDQwMzEzMDMwOVowdzELMAkGA1UEBhMCVVMxEzARBgNV
// SIG // BAgTCldhc2hpbmd0b24xEDAOBgNVBAcTB1JlZG1vbmQx
// SIG // HjAcBgNVBAoTFU1pY3Jvc29mdCBDb3Jwb3JhdGlvbjEh
// SIG // MB8GA1UEAxMYTWljcm9zb2Z0IFRpbWUtU3RhbXAgUENB
// SIG // MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA
// SIG // n6Fssd/bSJIqfGsuGeG94uPFmVEjUK3O3RhOJA/u0afR
// SIG // TK10MCAR6wfVVJUVSZQbQpKumFwwJtoAa+h7veyJBw/3
// SIG // DgSY8InMH8szJIed8vRnHCz8e+eIHernTqOhwSNTyo36
// SIG // Rc8J0F6v0LBCBKL5pmyTZ9co3EZTsIbQ5ShGLieshk9V
// SIG // UgzkAyz7apCQMG6H81kwnfp+1pez6CGXfvjSE/MIt1Nt
// SIG // UrRFkJ9IAEpHZhEnKWaol+TTBoFKovmEpxFHFAmCn4Tt
// SIG // VXj+AZodUAiFABAwRu233iNGu8QtVJ+vHnhBMXfMm987
// SIG // g5OhYQK1HQ2x/PebsgHOIktU//kFw8IgCwIDAQABo4IB
// SIG // qzCCAacwDwYDVR0TAQH/BAUwAwEB/zAdBgNVHQ4EFgQU
// SIG // IzT42VJGcArtQPt2+7MrsMM1sw8wCwYDVR0PBAQDAgGG
// SIG // MBAGCSsGAQQBgjcVAQQDAgEAMIGYBgNVHSMEgZAwgY2A
// SIG // FA6sgmBAVieX5SUT/CrhClOVWeSkoWOkYTBfMRMwEQYK
// SIG // CZImiZPyLGQBGRYDY29tMRkwFwYKCZImiZPyLGQBGRYJ
// SIG // bWljcm9zb2Z0MS0wKwYDVQQDEyRNaWNyb3NvZnQgUm9v
// SIG // dCBDZXJ0aWZpY2F0ZSBBdXRob3JpdHmCEHmtFqFKoKWt
// SIG // THNY9AcTLmUwUAYDVR0fBEkwRzBFoEOgQYY/aHR0cDov
// SIG // L2NybC5taWNyb3NvZnQuY29tL3BraS9jcmwvcHJvZHVj
// SIG // dHMvbWljcm9zb2Z0cm9vdGNlcnQuY3JsMFQGCCsGAQUF
// SIG // BwEBBEgwRjBEBggrBgEFBQcwAoY4aHR0cDovL3d3dy5t
// SIG // aWNyb3NvZnQuY29tL3BraS9jZXJ0cy9NaWNyb3NvZnRS
// SIG // b290Q2VydC5jcnQwEwYDVR0lBAwwCgYIKwYBBQUHAwgw
// SIG // DQYJKoZIhvcNAQEFBQADggIBABCXisNcA0Q23em0rXfb
// SIG // znlRTQGxLnRxW20ME6vOvnuPuC7UEqKMbWK4VwLLTiAT
// SIG // UJndekDiV7uvWJoc4R0Bhqy7ePKL0Ow7Ae7ivo8KBciN
// SIG // SOLwUxXdT6uS5OeNatWAweaU8gYvhQPpkSokInD79vzk
// SIG // eJkuDfcH4nC8GE6djmsKcpW4oTmcZy3FUQ7qYlw/FpiL
// SIG // ID/iBxoy+cwxSnYxPStyC8jqcD3/hQoT38IKYY7w17gX
// SIG // 606Lf8U1K16jv+u8fQtCe9RTciHuMMq7eGVcWwEXChQO
// SIG // 0toUmPU8uWZYsy0v5/mFhsxRVuidcJRsrDlM1PZ5v6oY
// SIG // emIp76KbKTQGdxpiyT0ebR+C8AvHLLvPQ7Pl+ex9teOk
// SIG // qHQ1uE7FcSMSJnYLPFKMcVpGQxS8s7OwTWfIn0L/gHkh
// SIG // gJ4VMGboQhJeGsieIiHQQ+kr6bv0SMws1NgygEwmKkgk
// SIG // X1rqVu+m3pmdyjpvvYEndAYR7nYhv5uCwSdUtrFqPYmh
// SIG // dmG0bqETpr+qR/ASb/2KMmyy/t9RyIwjyWa9nR2HEmQC
// SIG // PS2vWY+45CHltbDKY7R4VAXUQS5QrJSwpXirs6CWdRrZ
// SIG // kocTdSIvMqgIbqBbjCW/oO+EyiHW6x5PyZruSeD3AWVv
// SIG // iQt9yGnI5m7qp5fOMSn/DsVbXNhNG6HY+i+ePy5VFmvJ
// SIG // E6P9MYIEpTCCBKECAQEwgZAweTELMAkGA1UEBhMCVVMx
// SIG // EzARBgNVBAgTCldhc2hpbmd0b24xEDAOBgNVBAcTB1Jl
// SIG // ZG1vbmQxHjAcBgNVBAoTFU1pY3Jvc29mdCBDb3Jwb3Jh
// SIG // dGlvbjEjMCEGA1UEAxMaTWljcm9zb2Z0IENvZGUgU2ln
// SIG // bmluZyBQQ0ECEzMAAADKbNUyEjXE4VUAAQAAAMowCQYF
// SIG // Kw4DAhoFAKCBvjAZBgkqhkiG9w0BCQMxDAYKKwYBBAGC
// SIG // NwIBBDAcBgorBgEEAYI3AgELMQ4wDAYKKwYBBAGCNwIB
// SIG // FTAjBgkqhkiG9w0BCQQxFgQUVw5aSKYcZceY3XBYV5iY
// SIG // aWZZUq8wXgYKKwYBBAGCNwIBDDFQME6gJoAkAE0AaQBj
// SIG // AHIAbwBzAG8AZgB0ACAATABlAGEAcgBuAGkAbgBnoSSA
// SIG // Imh0dHA6Ly93d3cubWljcm9zb2Z0LmNvbS9sZWFybmlu
// SIG // ZyAwDQYJKoZIhvcNAQEBBQAEggEAH1qHBNy6LXgiQGX4
// SIG // IgWN0d7spFLGtaFHRLUofPdDaE6+nQMwgxkGX1HrXXwO
// SIG // F7Wtb4n1WkmtTXYWmwhPKEVx0uoY1Qqo2+Zwe4vds+XF
// SIG // Vxqi8/MH1QuiznpAujyKqg3TPbl/bTqc0OaDlrOysI9s
// SIG // tStaYEQkhRjs6h/zozKUZHS6KNyeMki3gT+FtvGmTYnf
// SIG // L3r49+NxN0y6ezDa+hh+9CskWvGt/tgez+wxcnHCTUGs
// SIG // 48qSWEKUYj/Hgc/43wCG4+/uaaFhM4JtAztwo1G8ZpEa
// SIG // x8oqCqucPUgRMeSDIN85U3AawxnT5bWiEBbFsVbDSRp8
// SIG // K00Y7LoV1aExTdYMgqGCAigwggIkBgkqhkiG9w0BCQYx
// SIG // ggIVMIICEQIBATCBjjB3MQswCQYDVQQGEwJVUzETMBEG
// SIG // A1UECBMKV2FzaGluZ3RvbjEQMA4GA1UEBxMHUmVkbW9u
// SIG // ZDEeMBwGA1UEChMVTWljcm9zb2Z0IENvcnBvcmF0aW9u
// SIG // MSEwHwYDVQQDExhNaWNyb3NvZnQgVGltZS1TdGFtcCBQ
// SIG // Q0ECEzMAAABZ1nPNUY7wIsUAAAAAAFkwCQYFKw4DAhoF
// SIG // AKBdMBgGCSqGSIb3DQEJAzELBgkqhkiG9w0BBwEwHAYJ
// SIG // KoZIhvcNAQkFMQ8XDTE0MTIxMTExNDUyNlowIwYJKoZI
// SIG // hvcNAQkEMRYEFDz9ni4eLfaTVICOp83TfIYvunx5MA0G
// SIG // CSqGSIb3DQEBBQUABIIBAKxfkFhK3zKL/AknxmhA+tfC
// SIG // 6+oUdwAcz00pcSnGgU/zSOsonk8QL+Itg5Bj6vleS/qb
// SIG // DU2pJtuH3CEbc7E8ahNiVV9/PKdu5Qppk2dOwfPaWONL
// SIG // dM/nY8Qdeqo2jEl5dHxpJ4eizzSwCWIrSGP8oH4I1+vG
// SIG // vQYTo+5ODvLfA9tuqOX5wM5ybHezrl0BKH0awyPNXCvq
// SIG // 5WaH9BdtLyZtZpKKTBy70gmaPVlfe1I9CkB+88MMswSn
// SIG // SVuvIWr29ijS5SAuXE3ky+a0U6NLXGnetGcu2U6NQmXX
// SIG // CZo4pcBd6PLg54viXsqd92xuhIaOFnfoikn2MTJ44qQR
// SIG // cD8jfD6u1Ik=
// SIG // End signature block
