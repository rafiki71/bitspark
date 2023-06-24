
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    // Adapted from https://github.com/then/is-promise/blob/master/index.js
    // Distributed under MIT License https://github.com/then/is-promise/blob/master/LICENSE
    function is_promise(value) {
        return !!value && (typeof value === 'object' || typeof value === 'function') && typeof value.then === 'function';
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    let src_url_equal_anchor;
    function src_url_equal(element_src, url) {
        if (!src_url_equal_anchor) {
            src_url_equal_anchor = document.createElement('a');
        }
        src_url_equal_anchor.href = url;
        return element_src === src_url_equal_anchor.href;
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function update_slot_base(slot, slot_definition, ctx, $$scope, slot_changes, get_slot_context_fn) {
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }
    function get_all_dirty_from_scope($$scope) {
        if ($$scope.ctx.length > 32) {
            const dirty = [];
            const length = $$scope.ctx.length / 32;
            for (let i = 0; i < length; i++) {
                dirty[i] = -1;
            }
            return dirty;
        }
        return -1;
    }
    function exclude_internal_props(props) {
        const result = {};
        for (const k in props)
            if (k[0] !== '$')
                result[k] = props[k];
        return result;
    }
    function compute_rest_props(props, keys) {
        const rest = {};
        keys = new Set(keys);
        for (const k in props)
            if (!keys.has(k) && k[0] !== '$')
                rest[k] = props[k];
        return rest;
    }
    function null_to_empty(value) {
        return value == null ? '' : value;
    }
    function set_store_value(store, ret, value) {
        store.set(value);
        return ret;
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        if (node.parentNode) {
            node.parentNode.removeChild(node);
        }
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    /**
     * List of attributes that should always be set through the attr method,
     * because updating them through the property setter doesn't work reliably.
     * In the example of `width`/`height`, the problem is that the setter only
     * accepts numeric values, but the attribute can also be set to a string like `50%`.
     * If this list becomes too big, rethink this approach.
     */
    const always_set_through_set_attribute = ['width', 'height'];
    function set_attributes(node, attributes) {
        // @ts-ignore
        const descriptors = Object.getOwnPropertyDescriptors(node.__proto__);
        for (const key in attributes) {
            if (attributes[key] == null) {
                node.removeAttribute(key);
            }
            else if (key === 'style') {
                node.style.cssText = attributes[key];
            }
            else if (key === '__value') {
                node.value = node[key] = attributes[key];
            }
            else if (descriptors[key] && descriptors[key].set && always_set_through_set_attribute.indexOf(key) === -1) {
                node[key] = attributes[key];
            }
            else {
                attr(node, key, attributes[key]);
            }
        }
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_data(text, data) {
        data = '' + data;
        if (text.data === data)
            return;
        text.data = data;
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function set_style(node, key, value, important) {
        if (value == null) {
            node.style.removeProperty(key);
        }
        else {
            node.style.setProperty(key, value, important ? 'important' : '');
        }
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail, { bubbles = false, cancelable = false } = {}) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, cancelable, detail);
        return e;
    }
    function construct_svelte_component(component, props) {
        return new component(props);
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    /**
     * The `onMount` function schedules a callback to run as soon as the component has been mounted to the DOM.
     * It must be called during the component's initialisation (but doesn't need to live *inside* the component;
     * it can be called from an external module).
     *
     * `onMount` does not run inside a [server-side component](/docs#run-time-server-side-component-api).
     *
     * https://svelte.dev/docs#run-time-svelte-onmount
     */
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    /**
     * Schedules a callback to run immediately before the component is unmounted.
     *
     * Out of `onMount`, `beforeUpdate`, `afterUpdate` and `onDestroy`, this is the
     * only one that runs inside a server-side component.
     *
     * https://svelte.dev/docs#run-time-svelte-ondestroy
     */
    function onDestroy(fn) {
        get_current_component().$$.on_destroy.push(fn);
    }
    /**
     * Creates an event dispatcher that can be used to dispatch [component events](/docs#template-syntax-component-directives-on-eventname).
     * Event dispatchers are functions that can take two arguments: `name` and `detail`.
     *
     * Component events created with `createEventDispatcher` create a
     * [CustomEvent](https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent).
     * These events do not [bubble](https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Building_blocks/Events#Event_bubbling_and_capture).
     * The `detail` argument corresponds to the [CustomEvent.detail](https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent/detail)
     * property and can contain any type of data.
     *
     * https://svelte.dev/docs#run-time-svelte-createeventdispatcher
     */
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail, { cancelable = false } = {}) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail, { cancelable });
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
                return !event.defaultPrevented;
            }
            return true;
        };
    }
    /**
     * Associates an arbitrary `context` object with the current component and the specified `key`
     * and returns that object. The context is then available to children of the component
     * (including slotted content) with `getContext`.
     *
     * Like lifecycle functions, this must be called during component initialisation.
     *
     * https://svelte.dev/docs#run-time-svelte-setcontext
     */
    function setContext(key, context) {
        get_current_component().$$.context.set(key, context);
        return context;
    }
    /**
     * Retrieves the context that belongs to the closest parent component with the specified `key`.
     * Must be called during component initialisation.
     *
     * https://svelte.dev/docs#run-time-svelte-getcontext
     */
    function getContext(key) {
        return get_current_component().$$.context.get(key);
    }

    const dirty_components = [];
    const binding_callbacks = [];
    let render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = /* @__PURE__ */ Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function add_flush_callback(fn) {
        flush_callbacks.push(fn);
    }
    // flush() calls callbacks in this order:
    // 1. All beforeUpdate callbacks, in order: parents before children
    // 2. All bind:this callbacks, in reverse order: children before parents.
    // 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
    //    for afterUpdates called during the initial onMount, which are called in
    //    reverse order: children before parents.
    // Since callbacks might update component values, which could trigger another
    // call to flush(), the following steps guard against this:
    // 1. During beforeUpdate, any updated components will be added to the
    //    dirty_components array and will cause a reentrant call to flush(). Because
    //    the flush index is kept outside the function, the reentrant call will pick
    //    up where the earlier call left off and go through all dirty components. The
    //    current_component value is saved and restored so that the reentrant call will
    //    not interfere with the "parent" flush() call.
    // 2. bind:this callbacks cannot trigger new flush() calls.
    // 3. During afterUpdate, any updated components will NOT have their afterUpdate
    //    callback called a second time; the seen_callbacks set, outside the flush()
    //    function, guarantees this behavior.
    const seen_callbacks = new Set();
    let flushidx = 0; // Do *not* move this inside the flush() function
    function flush() {
        // Do not reenter flush while dirty components are updated, as this can
        // result in an infinite loop. Instead, let the inner flush handle it.
        // Reentrancy is ok afterwards for bindings etc.
        if (flushidx !== 0) {
            return;
        }
        const saved_component = current_component;
        do {
            // first, call beforeUpdate functions
            // and update components
            try {
                while (flushidx < dirty_components.length) {
                    const component = dirty_components[flushidx];
                    flushidx++;
                    set_current_component(component);
                    update(component.$$);
                }
            }
            catch (e) {
                // reset dirty state to not end up in a deadlocked state and then rethrow
                dirty_components.length = 0;
                flushidx = 0;
                throw e;
            }
            set_current_component(null);
            dirty_components.length = 0;
            flushidx = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        seen_callbacks.clear();
        set_current_component(saved_component);
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    /**
     * Useful for example to execute remaining `afterUpdate` callbacks before executing `destroy`.
     */
    function flush_render_callbacks(fns) {
        const filtered = [];
        const targets = [];
        render_callbacks.forEach((c) => fns.indexOf(c) === -1 ? filtered.push(c) : targets.push(c));
        targets.forEach((c) => c());
        render_callbacks = filtered;
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
        else if (callback) {
            callback();
        }
    }

    function handle_promise(promise, info) {
        const token = info.token = {};
        function update(type, index, key, value) {
            if (info.token !== token)
                return;
            info.resolved = value;
            let child_ctx = info.ctx;
            if (key !== undefined) {
                child_ctx = child_ctx.slice();
                child_ctx[key] = value;
            }
            const block = type && (info.current = type)(child_ctx);
            let needs_flush = false;
            if (info.block) {
                if (info.blocks) {
                    info.blocks.forEach((block, i) => {
                        if (i !== index && block) {
                            group_outros();
                            transition_out(block, 1, 1, () => {
                                if (info.blocks[i] === block) {
                                    info.blocks[i] = null;
                                }
                            });
                            check_outros();
                        }
                    });
                }
                else {
                    info.block.d(1);
                }
                block.c();
                transition_in(block, 1);
                block.m(info.mount(), info.anchor);
                needs_flush = true;
            }
            info.block = block;
            if (info.blocks)
                info.blocks[index] = block;
            if (needs_flush) {
                flush();
            }
        }
        if (is_promise(promise)) {
            const current_component = get_current_component();
            promise.then(value => {
                set_current_component(current_component);
                update(info.then, 1, info.value, value);
                set_current_component(null);
            }, error => {
                set_current_component(current_component);
                update(info.catch, 2, info.error, error);
                set_current_component(null);
                if (!info.hasCatch) {
                    throw error;
                }
            });
            // if we previously had a then/catch block, destroy it
            if (info.current !== info.pending) {
                update(info.pending, 0);
                return true;
            }
        }
        else {
            if (info.current !== info.then) {
                update(info.then, 1, info.value, promise);
                return true;
            }
            info.resolved = promise;
        }
    }
    function update_await_block_branch(info, ctx, dirty) {
        const child_ctx = ctx.slice();
        const { resolved } = info;
        if (info.current === info.then) {
            child_ctx[info.value] = resolved;
        }
        if (info.current === info.catch) {
            child_ctx[info.error] = resolved;
        }
        info.block.p(child_ctx, dirty);
    }
    function outro_and_destroy_block(block, lookup) {
        transition_out(block, 1, 1, () => {
            lookup.delete(block.key);
        });
    }
    function update_keyed_each(old_blocks, dirty, get_key, dynamic, ctx, list, lookup, node, destroy, create_each_block, next, get_context) {
        let o = old_blocks.length;
        let n = list.length;
        let i = o;
        const old_indexes = {};
        while (i--)
            old_indexes[old_blocks[i].key] = i;
        const new_blocks = [];
        const new_lookup = new Map();
        const deltas = new Map();
        const updates = [];
        i = n;
        while (i--) {
            const child_ctx = get_context(ctx, list, i);
            const key = get_key(child_ctx);
            let block = lookup.get(key);
            if (!block) {
                block = create_each_block(key, child_ctx);
                block.c();
            }
            else if (dynamic) {
                // defer updates until all the DOM shuffling is done
                updates.push(() => block.p(child_ctx, dirty));
            }
            new_lookup.set(key, new_blocks[i] = block);
            if (key in old_indexes)
                deltas.set(key, Math.abs(i - old_indexes[key]));
        }
        const will_move = new Set();
        const did_move = new Set();
        function insert(block) {
            transition_in(block, 1);
            block.m(node, next);
            lookup.set(block.key, block);
            next = block.first;
            n--;
        }
        while (o && n) {
            const new_block = new_blocks[n - 1];
            const old_block = old_blocks[o - 1];
            const new_key = new_block.key;
            const old_key = old_block.key;
            if (new_block === old_block) {
                // do nothing
                next = new_block.first;
                o--;
                n--;
            }
            else if (!new_lookup.has(old_key)) {
                // remove old block
                destroy(old_block, lookup);
                o--;
            }
            else if (!lookup.has(new_key) || will_move.has(new_key)) {
                insert(new_block);
            }
            else if (did_move.has(old_key)) {
                o--;
            }
            else if (deltas.get(new_key) > deltas.get(old_key)) {
                did_move.add(new_key);
                insert(new_block);
            }
            else {
                will_move.add(old_key);
                o--;
            }
        }
        while (o--) {
            const old_block = old_blocks[o];
            if (!new_lookup.has(old_block.key))
                destroy(old_block, lookup);
        }
        while (n)
            insert(new_blocks[n - 1]);
        run_all(updates);
        return new_blocks;
    }

    function get_spread_update(levels, updates) {
        const update = {};
        const to_null_out = {};
        const accounted_for = { $$scope: 1 };
        let i = levels.length;
        while (i--) {
            const o = levels[i];
            const n = updates[i];
            if (n) {
                for (const key in o) {
                    if (!(key in n))
                        to_null_out[key] = 1;
                }
                for (const key in n) {
                    if (!accounted_for[key]) {
                        update[key] = n[key];
                        accounted_for[key] = 1;
                    }
                }
                levels[i] = n;
            }
            else {
                for (const key in o) {
                    accounted_for[key] = 1;
                }
            }
        }
        for (const key in to_null_out) {
            if (!(key in update))
                update[key] = undefined;
        }
        return update;
    }
    function get_spread_object(spread_props) {
        return typeof spread_props === 'object' && spread_props !== null ? spread_props : {};
    }

    function bind(component, name, callback) {
        const index = component.$$.props[name];
        if (index !== undefined) {
            component.$$.bound[index] = callback;
            callback(component.$$.ctx[index]);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = component.$$.on_mount.map(run).filter(is_function);
                // if the component was destroyed immediately
                // it will update the `$$.on_destroy` reference to `null`.
                // the destructured on_destroy may still reference to the old array
                if (component.$$.on_destroy) {
                    component.$$.on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            flush_render_callbacks($$.after_update);
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: [],
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            if (!is_function(callback)) {
                return noop;
            }
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    const subscriber_queue = [];
    /**
     * Creates a `Readable` store that allows reading by subscription.
     * @param value initial value
     * @param {StartStopNotifier} [start]
     */
    function readable(value, start) {
        return {
            subscribe: writable(value, start).subscribe
        };
    }
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=} start
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = new Set();
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (const subscriber of subscribers) {
                        subscriber[1]();
                        subscriber_queue.push(subscriber, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.add(subscriber);
            if (subscribers.size === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                subscribers.delete(subscriber);
                if (subscribers.size === 0 && stop) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }
    function derived(stores, fn, initial_value) {
        const single = !Array.isArray(stores);
        const stores_array = single
            ? [stores]
            : stores;
        const auto = fn.length < 2;
        return readable(initial_value, (set) => {
            let started = false;
            const values = [];
            let pending = 0;
            let cleanup = noop;
            const sync = () => {
                if (pending) {
                    return;
                }
                cleanup();
                const result = fn(single ? values[0] : values, set);
                if (auto) {
                    set(result);
                }
                else {
                    cleanup = is_function(result) ? result : noop;
                }
            };
            const unsubscribers = stores_array.map((store, i) => subscribe(store, (value) => {
                values[i] = value;
                pending &= ~(1 << i);
                if (started) {
                    sync();
                }
            }, () => {
                pending |= (1 << i);
            }));
            started = true;
            sync();
            return function stop() {
                run_all(unsubscribers);
                cleanup();
                // We need to set this to false because callbacks can still happen despite having unsubscribed:
                // Callbacks might already be placed in the queue which doesn't know it should no longer
                // invoke this derived store.
                started = false;
            };
        });
    }

    const LOCATION = {};
    const ROUTER = {};
    const HISTORY = {};

    /**
     * Adapted from https://github.com/reach/router/blob/b60e6dd781d5d3a4bdaaf4de665649c0f6a7e78d/src/lib/utils.js
     * https://github.com/reach/router/blob/master/LICENSE
     */

    const PARAM = /^:(.+)/;
    const SEGMENT_POINTS = 4;
    const STATIC_POINTS = 3;
    const DYNAMIC_POINTS = 2;
    const SPLAT_PENALTY = 1;
    const ROOT_POINTS = 1;

    /**
     * Split up the URI into segments delimited by `/`
     * Strip starting/ending `/`
     * @param {string} uri
     * @return {string[]}
     */
    const segmentize = (uri) => uri.replace(/(^\/+|\/+$)/g, "").split("/");
    /**
     * Strip `str` of potential start and end `/`
     * @param {string} string
     * @return {string}
     */
    const stripSlashes = (string) => string.replace(/(^\/+|\/+$)/g, "");
    /**
     * Score a route depending on how its individual segments look
     * @param {object} route
     * @param {number} index
     * @return {object}
     */
    const rankRoute = (route, index) => {
        const score = route.default
            ? 0
            : segmentize(route.path).reduce((score, segment) => {
                  score += SEGMENT_POINTS;

                  if (segment === "") {
                      score += ROOT_POINTS;
                  } else if (PARAM.test(segment)) {
                      score += DYNAMIC_POINTS;
                  } else if (segment[0] === "*") {
                      score -= SEGMENT_POINTS + SPLAT_PENALTY;
                  } else {
                      score += STATIC_POINTS;
                  }

                  return score;
              }, 0);

        return { route, score, index };
    };
    /**
     * Give a score to all routes and sort them on that
     * If two routes have the exact same score, we go by index instead
     * @param {object[]} routes
     * @return {object[]}
     */
    const rankRoutes = (routes) =>
        routes
            .map(rankRoute)
            .sort((a, b) =>
                a.score < b.score ? 1 : a.score > b.score ? -1 : a.index - b.index
            );
    /**
     * Ranks and picks the best route to match. Each segment gets the highest
     * amount of points, then the type of segment gets an additional amount of
     * points where
     *
     *  static > dynamic > splat > root
     *
     * This way we don't have to worry about the order of our routes, let the
     * computers do it.
     *
     * A route looks like this
     *
     *  { path, default, value }
     *
     * And a returned match looks like:
     *
     *  { route, params, uri }
     *
     * @param {object[]} routes
     * @param {string} uri
     * @return {?object}
     */
    const pick = (routes, uri) => {
        let match;
        let default_;

        const [uriPathname] = uri.split("?");
        const uriSegments = segmentize(uriPathname);
        const isRootUri = uriSegments[0] === "";
        const ranked = rankRoutes(routes);

        for (let i = 0, l = ranked.length; i < l; i++) {
            const route = ranked[i].route;
            let missed = false;

            if (route.default) {
                default_ = {
                    route,
                    params: {},
                    uri,
                };
                continue;
            }

            const routeSegments = segmentize(route.path);
            const params = {};
            const max = Math.max(uriSegments.length, routeSegments.length);
            let index = 0;

            for (; index < max; index++) {
                const routeSegment = routeSegments[index];
                const uriSegment = uriSegments[index];

                if (routeSegment && routeSegment[0] === "*") {
                    // Hit a splat, just grab the rest, and return a match
                    // uri:   /files/documents/work
                    // route: /files/* or /files/*splatname
                    const splatName =
                        routeSegment === "*" ? "*" : routeSegment.slice(1);

                    params[splatName] = uriSegments
                        .slice(index)
                        .map(decodeURIComponent)
                        .join("/");
                    break;
                }

                if (typeof uriSegment === "undefined") {
                    // URI is shorter than the route, no match
                    // uri:   /users
                    // route: /users/:userId
                    missed = true;
                    break;
                }

                const dynamicMatch = PARAM.exec(routeSegment);

                if (dynamicMatch && !isRootUri) {
                    const value = decodeURIComponent(uriSegment);
                    params[dynamicMatch[1]] = value;
                } else if (routeSegment !== uriSegment) {
                    // Current segments don't match, not dynamic, not splat, so no match
                    // uri:   /users/123/settings
                    // route: /users/:id/profile
                    missed = true;
                    break;
                }
            }

            if (!missed) {
                match = {
                    route,
                    params,
                    uri: "/" + uriSegments.slice(0, index).join("/"),
                };
                break;
            }
        }

        return match || default_ || null;
    };
    /**
     * Add the query to the pathname if a query is given
     * @param {string} pathname
     * @param {string} [query]
     * @return {string}
     */
    const addQuery = (pathname, query) => pathname + (query ? `?${query}` : "");
    /**
     * Resolve URIs as though every path is a directory, no files. Relative URIs
     * in the browser can feel awkward because not only can you be "in a directory",
     * you can be "at a file", too. For example:
     *
     *  browserSpecResolve('foo', '/bar/') => /bar/foo
     *  browserSpecResolve('foo', '/bar') => /foo
     *
     * But on the command line of a file system, it's not as complicated. You can't
     * `cd` from a file, only directories. This way, links have to know less about
     * their current path. To go deeper you can do this:
     *
     *  <Link to="deeper"/>
     *  // instead of
     *  <Link to=`{${props.uri}/deeper}`/>
     *
     * Just like `cd`, if you want to go deeper from the command line, you do this:
     *
     *  cd deeper
     *  # not
     *  cd $(pwd)/deeper
     *
     * By treating every path as a directory, linking to relative paths should
     * require less contextual information and (fingers crossed) be more intuitive.
     * @param {string} to
     * @param {string} base
     * @return {string}
     */
    const resolve = (to, base) => {
        // /foo/bar, /baz/qux => /foo/bar
        if (to.startsWith("/")) return to;

        const [toPathname, toQuery] = to.split("?");
        const [basePathname] = base.split("?");
        const toSegments = segmentize(toPathname);
        const baseSegments = segmentize(basePathname);

        // ?a=b, /users?b=c => /users?a=b
        if (toSegments[0] === "") return addQuery(basePathname, toQuery);

        // profile, /users/789 => /users/789/profile

        if (!toSegments[0].startsWith(".")) {
            const pathname = baseSegments.concat(toSegments).join("/");
            return addQuery((basePathname === "/" ? "" : "/") + pathname, toQuery);
        }

        // ./       , /users/123 => /users/123
        // ../      , /users/123 => /users
        // ../..    , /users/123 => /
        // ../../one, /a/b/c/d   => /a/b/one
        // .././one , /a/b/c/d   => /a/b/c/one
        const allSegments = baseSegments.concat(toSegments);
        const segments = [];

        allSegments.forEach((segment) => {
            if (segment === "..") segments.pop();
            else if (segment !== ".") segments.push(segment);
        });

        return addQuery("/" + segments.join("/"), toQuery);
    };
    /**
     * Combines the `basepath` and the `path` into one path.
     * @param {string} basepath
     * @param {string} path
     */
    const combinePaths = (basepath, path) =>
        `${stripSlashes(
        path === "/"
            ? basepath
            : `${stripSlashes(basepath)}/${stripSlashes(path)}`
    )}/`;
    /**
     * Decides whether a given `event` should result in a navigation or not.
     * @param {object} event
     */
    const shouldNavigate = (event) =>
        !event.defaultPrevented &&
        event.button === 0 &&
        !(event.metaKey || event.altKey || event.ctrlKey || event.shiftKey);

    const canUseDOM = typeof window !== "undefined" && "document" in window;

    /**
     * Adapted from https://github.com/reach/router/blob/b60e6dd781d5d3a4bdaaf4de665649c0f6a7e78d/src/lib/history.js
     * https://github.com/reach/router/blob/master/LICENSE
     */

    const getLocation = (source) => {
        return {
            ...source.location,
            state: source.history.state,
            key: (source.history.state && source.history.state.key) || "initial",
        };
    };
    const createHistory = (source) => {
        const listeners = [];
        let location = getLocation(source);

        return {
            get location() {
                return location;
            },

            listen(listener) {
                listeners.push(listener);

                const popstateListener = () => {
                    location = getLocation(source);
                    listener({ location, action: "POP" });
                };

                source.addEventListener("popstate", popstateListener);

                return () => {
                    source.removeEventListener("popstate", popstateListener);
                    const index = listeners.indexOf(listener);
                    listeners.splice(index, 1);
                };
            },

            navigate(to, { state, replace = false } = {}) {
                state = { ...state, key: Date.now() + "" };
                // try...catch iOS Safari limits to 100 pushState calls
                try {
                    if (replace) source.history.replaceState(state, "", to);
                    else source.history.pushState(state, "", to);
                } catch (e) {
                    source.location[replace ? "replace" : "assign"](to);
                }
                location = getLocation(source);
                listeners.forEach((listener) =>
                    listener({ location, action: "PUSH" })
                );
                document.activeElement.blur();
            },
        };
    };
    // Stores history entries in memory for testing or other platforms like Native
    const createMemorySource = (initialPathname = "/") => {
        let index = 0;
        const stack = [{ pathname: initialPathname, search: "" }];
        const states = [];

        return {
            get location() {
                return stack[index];
            },
            addEventListener(name, fn) {},
            removeEventListener(name, fn) {},
            history: {
                get entries() {
                    return stack;
                },
                get index() {
                    return index;
                },
                get state() {
                    return states[index];
                },
                pushState(state, _, uri) {
                    const [pathname, search = ""] = uri.split("?");
                    index++;
                    stack.push({ pathname, search });
                    states.push(state);
                },
                replaceState(state, _, uri) {
                    const [pathname, search = ""] = uri.split("?");
                    stack[index] = { pathname, search };
                    states[index] = state;
                },
            },
        };
    };
    // Global history uses window.history as the source if available,
    // otherwise a memory history
    const globalHistory = createHistory(canUseDOM ? window : createMemorySource());
    const { navigate } = globalHistory;

    /* node_modules/svelte-routing/src/Router.svelte generated by Svelte v3.59.1 */

    const get_default_slot_changes$2 = dirty => ({
    	route: dirty & /*$activeRoute*/ 2,
    	location: dirty & /*$location*/ 1
    });

    const get_default_slot_context$2 = ctx => ({
    	route: /*$activeRoute*/ ctx[1] && /*$activeRoute*/ ctx[1].uri,
    	location: /*$location*/ ctx[0]
    });

    function create_fragment$f(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[12].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[11], get_default_slot_context$2);

    	return {
    		c() {
    			if (default_slot) default_slot.c();
    		},
    		m(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope, $activeRoute, $location*/ 2051)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[11],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[11])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[11], dirty, get_default_slot_changes$2),
    						get_default_slot_context$2
    					);
    				}
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};
    }

    function instance$e($$self, $$props, $$invalidate) {
    	let $location;
    	let $routes;
    	let $base;
    	let $activeRoute;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	let { basepath = "/" } = $$props;
    	let { url = null } = $$props;
    	let { history = globalHistory } = $$props;
    	setContext(HISTORY, history);
    	const locationContext = getContext(LOCATION);
    	const routerContext = getContext(ROUTER);
    	const routes = writable([]);
    	component_subscribe($$self, routes, value => $$invalidate(9, $routes = value));
    	const activeRoute = writable(null);
    	component_subscribe($$self, activeRoute, value => $$invalidate(1, $activeRoute = value));
    	let hasActiveRoute = false; // Used in SSR to synchronously set that a Route is active.

    	// If locationContext is not set, this is the topmost Router in the tree.
    	// If the `url` prop is given we force the location to it.
    	const location = locationContext || writable(url ? { pathname: url } : history.location);

    	component_subscribe($$self, location, value => $$invalidate(0, $location = value));

    	// If routerContext is set, the routerBase of the parent Router
    	// will be the base for this Router's descendants.
    	// If routerContext is not set, the path and resolved uri will both
    	// have the value of the basepath prop.
    	const base = routerContext
    	? routerContext.routerBase
    	: writable({ path: basepath, uri: basepath });

    	component_subscribe($$self, base, value => $$invalidate(10, $base = value));

    	const routerBase = derived([base, activeRoute], ([base, activeRoute]) => {
    		// If there is no activeRoute, the routerBase will be identical to the base.
    		if (!activeRoute) return base;

    		const { path: basepath } = base;
    		const { route, uri } = activeRoute;

    		// Remove the potential /* or /*splatname from
    		// the end of the child Routes relative paths.
    		const path = route.default
    		? basepath
    		: route.path.replace(/\*.*$/, "");

    		return { path, uri };
    	});

    	const registerRoute = route => {
    		const { path: basepath } = $base;
    		let { path } = route;

    		// We store the original path in the _path property so we can reuse
    		// it when the basepath changes. The only thing that matters is that
    		// the route reference is intact, so mutation is fine.
    		route._path = path;

    		route.path = combinePaths(basepath, path);

    		if (typeof window === "undefined") {
    			// In SSR we should set the activeRoute immediately if it is a match.
    			// If there are more Routes being registered after a match is found,
    			// we just skip them.
    			if (hasActiveRoute) return;

    			const matchingRoute = pick([route], $location.pathname);

    			if (matchingRoute) {
    				activeRoute.set(matchingRoute);
    				hasActiveRoute = true;
    			}
    		} else {
    			routes.update(rs => [...rs, route]);
    		}
    	};

    	const unregisterRoute = route => {
    		routes.update(rs => rs.filter(r => r !== route));
    	};

    	if (!locationContext) {
    		// The topmost Router in the tree is responsible for updating
    		// the location store and supplying it through context.
    		onMount(() => {
    			const unlisten = history.listen(event => {
    				location.set(event.location);
    			});

    			return unlisten;
    		});

    		setContext(LOCATION, location);
    	}

    	setContext(ROUTER, {
    		activeRoute,
    		base,
    		routerBase,
    		registerRoute,
    		unregisterRoute
    	});

    	$$self.$$set = $$props => {
    		if ('basepath' in $$props) $$invalidate(6, basepath = $$props.basepath);
    		if ('url' in $$props) $$invalidate(7, url = $$props.url);
    		if ('history' in $$props) $$invalidate(8, history = $$props.history);
    		if ('$$scope' in $$props) $$invalidate(11, $$scope = $$props.$$scope);
    	};

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$base*/ 1024) {
    			// This reactive statement will update all the Routes' path when
    			// the basepath changes.
    			{
    				const { path: basepath } = $base;

    				routes.update(rs => rs.map(r => ({
    					...r,
    					path: combinePaths(basepath, r._path)
    				})));
    			}
    		}

    		if ($$self.$$.dirty & /*$routes, $location*/ 513) {
    			// This reactive statement will be run when the Router is created
    			// when there are no Routes and then again the following tick, so it
    			// will not find an active Route in SSR and in the browser it will only
    			// pick an active Route after all Routes have been registered.
    			{
    				const bestMatch = pick($routes, $location.pathname);
    				activeRoute.set(bestMatch);
    			}
    		}
    	};

    	return [
    		$location,
    		$activeRoute,
    		routes,
    		activeRoute,
    		location,
    		base,
    		basepath,
    		url,
    		history,
    		$routes,
    		$base,
    		$$scope,
    		slots
    	];
    }

    class Router extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$e, create_fragment$f, safe_not_equal, { basepath: 6, url: 7, history: 8 });
    	}
    }

    /* node_modules/svelte-routing/src/Route.svelte generated by Svelte v3.59.1 */
    const get_default_slot_changes$1 = dirty => ({ params: dirty & /*routeParams*/ 4 });
    const get_default_slot_context$1 = ctx => ({ params: /*routeParams*/ ctx[2] });

    // (44:0) {#if $activeRoute && $activeRoute.route === route}
    function create_if_block$6(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block_1$5, create_else_block$1];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*component*/ ctx[0]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	return {
    		c() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach(if_block_anchor);
    		}
    	};
    }

    // (53:4) {:else}
    function create_else_block$1(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[8].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[7], get_default_slot_context$1);

    	return {
    		c() {
    			if (default_slot) default_slot.c();
    		},
    		m(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope, routeParams*/ 132)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[7],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[7])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[7], dirty, get_default_slot_changes$1),
    						get_default_slot_context$1
    					);
    				}
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};
    }

    // (45:4) {#if component}
    function create_if_block_1$5(ctx) {
    	let await_block_anchor;
    	let promise;
    	let current;

    	let info = {
    		ctx,
    		current: null,
    		token: null,
    		hasCatch: false,
    		pending: create_pending_block,
    		then: create_then_block,
    		catch: create_catch_block,
    		value: 12,
    		blocks: [,,,]
    	};

    	handle_promise(promise = /*component*/ ctx[0], info);

    	return {
    		c() {
    			await_block_anchor = empty();
    			info.block.c();
    		},
    		m(target, anchor) {
    			insert(target, await_block_anchor, anchor);
    			info.block.m(target, info.anchor = anchor);
    			info.mount = () => await_block_anchor.parentNode;
    			info.anchor = await_block_anchor;
    			current = true;
    		},
    		p(new_ctx, dirty) {
    			ctx = new_ctx;
    			info.ctx = ctx;

    			if (dirty & /*component*/ 1 && promise !== (promise = /*component*/ ctx[0]) && handle_promise(promise, info)) ; else {
    				update_await_block_branch(info, ctx, dirty);
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(info.block);
    			current = true;
    		},
    		o(local) {
    			for (let i = 0; i < 3; i += 1) {
    				const block = info.blocks[i];
    				transition_out(block);
    			}

    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(await_block_anchor);
    			info.block.d(detaching);
    			info.token = null;
    			info = null;
    		}
    	};
    }

    // (1:0) <script>     import { getContext, onDestroy }
    function create_catch_block(ctx) {
    	return {
    		c: noop,
    		m: noop,
    		p: noop,
    		i: noop,
    		o: noop,
    		d: noop
    	};
    }

    // (46:49)              <svelte:component                 this={resolvedComponent?.default || resolvedComponent}
    function create_then_block(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;
    	const switch_instance_spread_levels = [/*routeParams*/ ctx[2], /*routeProps*/ ctx[3]];
    	var switch_value = /*resolvedComponent*/ ctx[12]?.default || /*resolvedComponent*/ ctx[12];

    	function switch_props(ctx) {
    		let switch_instance_props = {};

    		for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
    			switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
    		}

    		return { props: switch_instance_props };
    	}

    	if (switch_value) {
    		switch_instance = construct_svelte_component(switch_value, switch_props());
    	}

    	return {
    		c() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		m(target, anchor) {
    			if (switch_instance) mount_component(switch_instance, target, anchor);
    			insert(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p(ctx, dirty) {
    			const switch_instance_changes = (dirty & /*routeParams, routeProps*/ 12)
    			? get_spread_update(switch_instance_spread_levels, [
    					dirty & /*routeParams*/ 4 && get_spread_object(/*routeParams*/ ctx[2]),
    					dirty & /*routeProps*/ 8 && get_spread_object(/*routeProps*/ ctx[3])
    				])
    			: {};

    			if (dirty & /*component*/ 1 && switch_value !== (switch_value = /*resolvedComponent*/ ctx[12]?.default || /*resolvedComponent*/ ctx[12])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = construct_svelte_component(switch_value, switch_props());
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};
    }

    // (1:0) <script>     import { getContext, onDestroy }
    function create_pending_block(ctx) {
    	return {
    		c: noop,
    		m: noop,
    		p: noop,
    		i: noop,
    		o: noop,
    		d: noop
    	};
    }

    function create_fragment$e(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*$activeRoute*/ ctx[1] && /*$activeRoute*/ ctx[1].route === /*route*/ ctx[5] && create_if_block$6(ctx);

    	return {
    		c() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p(ctx, [dirty]) {
    			if (/*$activeRoute*/ ctx[1] && /*$activeRoute*/ ctx[1].route === /*route*/ ctx[5]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*$activeRoute*/ 2) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$6(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach(if_block_anchor);
    		}
    	};
    }

    function instance$d($$self, $$props, $$invalidate) {
    	let $activeRoute;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	let { path = "" } = $$props;
    	let { component = null } = $$props;
    	let routeParams = {};
    	let routeProps = {};
    	const { registerRoute, unregisterRoute, activeRoute } = getContext(ROUTER);
    	component_subscribe($$self, activeRoute, value => $$invalidate(1, $activeRoute = value));

    	const route = {
    		path,
    		// If no path prop is given, this Route will act as the default Route
    		// that is rendered if no other Route in the Router is a match.
    		default: path === ""
    	};

    	registerRoute(route);

    	onDestroy(() => {
    		unregisterRoute(route);
    	});

    	$$self.$$set = $$new_props => {
    		$$invalidate(11, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ('path' in $$new_props) $$invalidate(6, path = $$new_props.path);
    		if ('component' in $$new_props) $$invalidate(0, component = $$new_props.component);
    		if ('$$scope' in $$new_props) $$invalidate(7, $$scope = $$new_props.$$scope);
    	};

    	$$self.$$.update = () => {
    		{
    			if ($activeRoute && $activeRoute.route === route) {
    				$$invalidate(2, routeParams = $activeRoute.params);
    			}

    			const { component: c, path, ...rest } = $$props;
    			$$invalidate(3, routeProps = rest);
    			canUseDOM && window?.scrollTo(0, 0);

    			if (c) {
    				if (c.toString().startsWith("class ")) $$invalidate(0, component = c); else $$invalidate(0, component = c());
    			}
    		}
    	};

    	$$props = exclude_internal_props($$props);

    	return [
    		component,
    		$activeRoute,
    		routeParams,
    		routeProps,
    		activeRoute,
    		route,
    		path,
    		$$scope,
    		slots
    	];
    }

    class Route extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$d, create_fragment$e, safe_not_equal, { path: 6, component: 0 });
    	}
    }

    /* node_modules/svelte-routing/src/Link.svelte generated by Svelte v3.59.1 */
    const get_default_slot_changes = dirty => ({ active: dirty & /*ariaCurrent*/ 4 });
    const get_default_slot_context = ctx => ({ active: !!/*ariaCurrent*/ ctx[2] });

    function create_fragment$d(ctx) {
    	let a;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[16].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[15], get_default_slot_context);

    	let a_levels = [
    		{ href: /*href*/ ctx[0] },
    		{ "aria-current": /*ariaCurrent*/ ctx[2] },
    		/*props*/ ctx[1],
    		/*$$restProps*/ ctx[6]
    	];

    	let a_data = {};

    	for (let i = 0; i < a_levels.length; i += 1) {
    		a_data = assign(a_data, a_levels[i]);
    	}

    	return {
    		c() {
    			a = element("a");
    			if (default_slot) default_slot.c();
    			set_attributes(a, a_data);
    		},
    		m(target, anchor) {
    			insert(target, a, anchor);

    			if (default_slot) {
    				default_slot.m(a, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = listen(a, "click", /*onClick*/ ctx[5]);
    				mounted = true;
    			}
    		},
    		p(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope, ariaCurrent*/ 32772)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[15],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[15])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[15], dirty, get_default_slot_changes),
    						get_default_slot_context
    					);
    				}
    			}

    			set_attributes(a, a_data = get_spread_update(a_levels, [
    				(!current || dirty & /*href*/ 1) && { href: /*href*/ ctx[0] },
    				(!current || dirty & /*ariaCurrent*/ 4) && { "aria-current": /*ariaCurrent*/ ctx[2] },
    				dirty & /*props*/ 2 && /*props*/ ctx[1],
    				dirty & /*$$restProps*/ 64 && /*$$restProps*/ ctx[6]
    			]));
    		},
    		i(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(a);
    			if (default_slot) default_slot.d(detaching);
    			mounted = false;
    			dispose();
    		}
    	};
    }

    function instance$c($$self, $$props, $$invalidate) {
    	let ariaCurrent;
    	const omit_props_names = ["to","replace","state","getProps"];
    	let $$restProps = compute_rest_props($$props, omit_props_names);
    	let $location;
    	let $base;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	let { to = "#" } = $$props;
    	let { replace = false } = $$props;
    	let { state = {} } = $$props;
    	let { getProps = () => ({}) } = $$props;
    	const location = getContext(LOCATION);
    	component_subscribe($$self, location, value => $$invalidate(13, $location = value));
    	const { base } = getContext(ROUTER);
    	component_subscribe($$self, base, value => $$invalidate(14, $base = value));
    	const { navigate } = getContext(HISTORY);
    	const dispatch = createEventDispatcher();
    	let href, isPartiallyCurrent, isCurrent, props;

    	const onClick = event => {
    		dispatch("click", event);

    		if (shouldNavigate(event)) {
    			event.preventDefault();

    			// Don't push another entry to the history stack when the user
    			// clicks on a Link to the page they are currently on.
    			const shouldReplace = $location.pathname === href || replace;

    			navigate(href, { state, replace: shouldReplace });
    		}
    	};

    	$$self.$$set = $$new_props => {
    		$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
    		$$invalidate(6, $$restProps = compute_rest_props($$props, omit_props_names));
    		if ('to' in $$new_props) $$invalidate(7, to = $$new_props.to);
    		if ('replace' in $$new_props) $$invalidate(8, replace = $$new_props.replace);
    		if ('state' in $$new_props) $$invalidate(9, state = $$new_props.state);
    		if ('getProps' in $$new_props) $$invalidate(10, getProps = $$new_props.getProps);
    		if ('$$scope' in $$new_props) $$invalidate(15, $$scope = $$new_props.$$scope);
    	};

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*to, $base*/ 16512) {
    			$$invalidate(0, href = to === "/" ? $base.uri : resolve(to, $base.uri));
    		}

    		if ($$self.$$.dirty & /*$location, href*/ 8193) {
    			$$invalidate(11, isPartiallyCurrent = $location.pathname.startsWith(href));
    		}

    		if ($$self.$$.dirty & /*href, $location*/ 8193) {
    			$$invalidate(12, isCurrent = href === $location.pathname);
    		}

    		if ($$self.$$.dirty & /*isCurrent*/ 4096) {
    			$$invalidate(2, ariaCurrent = isCurrent ? "page" : undefined);
    		}

    		$$invalidate(1, props = getProps({
    			location: $location,
    			href,
    			isPartiallyCurrent,
    			isCurrent,
    			existingProps: $$restProps
    		}));
    	};

    	return [
    		href,
    		props,
    		ariaCurrent,
    		location,
    		base,
    		onClick,
    		$$restProps,
    		to,
    		replace,
    		state,
    		getProps,
    		isPartiallyCurrent,
    		isCurrent,
    		$location,
    		$base,
    		$$scope,
    		slots
    	];
    }

    class Link extends SvelteComponent {
    	constructor(options) {
    		super();

    		init(this, options, instance$c, create_fragment$d, safe_not_equal, {
    			to: 7,
    			replace: 8,
    			state: 9,
    			getProps: 10
    		});
    	}
    }

    /* src/components/Cards/IdeaCard.svelte generated by Svelte v3.59.1 */

    function create_default_slot$5(ctx) {
    	let t;

    	return {
    		c() {
    			t = text("Show Idea");
    		},
    		m(target, anchor) {
    			insert(target, t, anchor);
    		},
    		d(detaching) {
    			if (detaching) detach(t);
    		}
    	};
    }

    function create_fragment$c(ctx) {
    	let div2;
    	let img;
    	let img_src_value;
    	let t0;
    	let div0;
    	let h3;
    	let t1_value = /*card*/ ctx[0].name + "";
    	let t1;
    	let t2;
    	let h4;
    	let t3_value = /*card*/ ctx[0].subtitle + "";
    	let t3;
    	let t4;
    	let p;
    	let t5_value = truncateMessage(/*card*/ ctx[0].abstract, 1000) + "";
    	let t5;
    	let t6;
    	let div1;
    	let link;
    	let current;

    	link = new Link({
    			props: {
    				class: "bg-red-400 active:bg-red-500 uppercase text-white font-bold hover:shadow-md shadow text-xs px-4 py-2 rounded outline-none focus:outline-none sm:mr-2 mb-1 ease-linear transition-all duration-150",
    				to: `/idea/${/*card*/ ctx[0].id}`,
    				$$slots: { default: [create_default_slot$5] },
    				$$scope: { ctx }
    			}
    		});

    	return {
    		c() {
    			div2 = element("div");
    			img = element("img");
    			t0 = space();
    			div0 = element("div");
    			h3 = element("h3");
    			t1 = text(t1_value);
    			t2 = space();
    			h4 = element("h4");
    			t3 = text(t3_value);
    			t4 = space();
    			p = element("p");
    			t5 = text(t5_value);
    			t6 = space();
    			div1 = element("div");
    			create_component(link.$$.fragment);
    			if (!src_url_equal(img.src, img_src_value = /*card*/ ctx[0].bannerImage)) attr(img, "src", img_src_value);
    			attr(img, "alt", "Idea banner");
    			attr(img, "class", "w-full h-48 object-cover rounded-t-lg");
    			attr(h3, "class", "text-2xl font-semibold text-blueGray-700 mb-2");
    			attr(h4, "class", "text-xl font-medium text-blueGray-500 mb-4");
    			attr(p, "class", "text-lg text-blueGray-600");
    			attr(div0, "class", "px-6 py-4");
    			attr(div1, "class", "px-6 py-4 flex items-center justify-start");
    			attr(div2, "class", "relative flex flex-col min-w-0 break-words bg-white w-full mb-6 shadow-xl rounded-lg");
    		},
    		m(target, anchor) {
    			insert(target, div2, anchor);
    			append(div2, img);
    			append(div2, t0);
    			append(div2, div0);
    			append(div0, h3);
    			append(h3, t1);
    			append(div0, t2);
    			append(div0, h4);
    			append(h4, t3);
    			append(div0, t4);
    			append(div0, p);
    			append(p, t5);
    			append(div2, t6);
    			append(div2, div1);
    			mount_component(link, div1, null);
    			current = true;
    		},
    		p(ctx, [dirty]) {
    			if (!current || dirty & /*card*/ 1 && !src_url_equal(img.src, img_src_value = /*card*/ ctx[0].bannerImage)) {
    				attr(img, "src", img_src_value);
    			}

    			if ((!current || dirty & /*card*/ 1) && t1_value !== (t1_value = /*card*/ ctx[0].name + "")) set_data(t1, t1_value);
    			if ((!current || dirty & /*card*/ 1) && t3_value !== (t3_value = /*card*/ ctx[0].subtitle + "")) set_data(t3, t3_value);
    			if ((!current || dirty & /*card*/ 1) && t5_value !== (t5_value = truncateMessage(/*card*/ ctx[0].abstract, 1000) + "")) set_data(t5, t5_value);
    			const link_changes = {};
    			if (dirty & /*card*/ 1) link_changes.to = `/idea/${/*card*/ ctx[0].id}`;

    			if (dirty & /*$$scope*/ 2) {
    				link_changes.$$scope = { dirty, ctx };
    			}

    			link.$set(link_changes);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(link.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(link.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(div2);
    			destroy_component(link);
    		}
    	};
    }

    function truncateMessage(message, maxLength) {
    	const strippedMessage = message.replace(/<[^>]+>/g, "");

    	return strippedMessage.length <= maxLength
    	? message
    	: message.slice(0, maxLength) + "...";
    }

    function instance$b($$self, $$props, $$invalidate) {
    	let { card } = $$props;

    	$$self.$$set = $$props => {
    		if ('card' in $$props) $$invalidate(0, card = $$props.card);
    	};

    	return [card];
    }

    class IdeaCard extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$b, create_fragment$c, safe_not_equal, { card: 0 });
    	}
    }

    /* src/components/ProfileImg.svelte generated by Svelte v3.59.1 */

    function create_default_slot$4(ctx) {
    	let img;
    	let img_class_value;
    	let img_src_value;

    	return {
    		c() {
    			img = element("img");
    			attr(img, "class", img_class_value = "profile-image " + (/*githubVerified*/ ctx[2] ? '' : 'grayscale'));
    			if (!src_url_equal(img.src, img_src_value = /*picture*/ ctx[1])) attr(img, "src", img_src_value);
    			attr(img, "alt", "Profile Img");
    			attr(img, "style", /*styleString*/ ctx[3]);
    		},
    		m(target, anchor) {
    			insert(target, img, anchor);
    		},
    		p(ctx, dirty) {
    			if (dirty & /*githubVerified*/ 4 && img_class_value !== (img_class_value = "profile-image " + (/*githubVerified*/ ctx[2] ? '' : 'grayscale'))) {
    				attr(img, "class", img_class_value);
    			}

    			if (dirty & /*picture*/ 2 && !src_url_equal(img.src, img_src_value = /*picture*/ ctx[1])) {
    				attr(img, "src", img_src_value);
    			}

    			if (dirty & /*styleString*/ 8) {
    				attr(img, "style", /*styleString*/ ctx[3]);
    			}
    		},
    		d(detaching) {
    			if (detaching) detach(img);
    		}
    	};
    }

    function create_fragment$b(ctx) {
    	let link;
    	let current;

    	link = new Link({
    			props: {
    				to: `/profile/${/*pubkey*/ ctx[0]}`,
    				$$slots: { default: [create_default_slot$4] },
    				$$scope: { ctx }
    			}
    		});

    	return {
    		c() {
    			create_component(link.$$.fragment);
    		},
    		m(target, anchor) {
    			mount_component(link, target, anchor);
    			current = true;
    		},
    		p(ctx, [dirty]) {
    			const link_changes = {};
    			if (dirty & /*pubkey*/ 1) link_changes.to = `/profile/${/*pubkey*/ ctx[0]}`;

    			if (dirty & /*$$scope, githubVerified, picture, styleString*/ 142) {
    				link_changes.$$scope = { dirty, ctx };
    			}

    			link.$set(link_changes);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(link.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(link.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			destroy_component(link, detaching);
    		}
    	};
    }

    function instance$a($$self, $$props, $$invalidate) {
    	let styleString;
    	let { profile = {} } = $$props;
    	let { style = {} } = $$props;
    	let pubkey, picture, githubVerified; // initial declaration

    	// Converts style object to CSS string
    	const toStyleString = styleObj => Object.entries(styleObj).map(([prop, value]) => `${prop}: ${value}`).join('; ');

    	$$self.$$set = $$props => {
    		if ('profile' in $$props) $$invalidate(4, profile = $$props.profile);
    		if ('style' in $$props) $$invalidate(5, style = $$props.style);
    	};

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*profile*/ 16) {
    			// Reactive statements to update values when profile changes
    			$$invalidate(0, pubkey = profile.pubkey);
    		}

    		if ($$self.$$.dirty & /*profile*/ 16) {
    			$$invalidate(1, picture = profile.picture);
    		}

    		if ($$self.$$.dirty & /*profile*/ 16) {
    			$$invalidate(2, githubVerified = profile.githubVerified);
    		}

    		if ($$self.$$.dirty & /*style*/ 32) {
    			$$invalidate(3, styleString = toStyleString({ ...style, 'border-radius': '50%' })); // added border-radius here
    		}
    	};

    	return [pubkey, picture, githubVerified, styleString, profile, style];
    }

    class ProfileImg extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$a, create_fragment$b, safe_not_equal, { profile: 4, style: 5 });
    	}
    }

    var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

    function createCommonjsModule(fn) {
      var module = { exports: {} };
    	return fn(module, module.exports), module.exports;
    }

    var node = createCommonjsModule(function (module, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.is_node = void 0;
    //================================================================
    /**
     * @packageDocumentation
     * @module std
     */
    //================================================================
    var is_node_ = null;
    /**
     * Test whether the code is running on NodeJS.
     *
     * @return Whether NodeJS or not.
     */
    function is_node() {
        if (is_node_ === null)
            is_node_ =
                typeof commonjsGlobal === "object" &&
                    typeof commonjsGlobal.process === "object" &&
                    typeof commonjsGlobal.process.versions === "object" &&
                    typeof commonjsGlobal.process.versions.node !== "undefined";
        return is_node_;
    }
    exports.is_node = is_node;
    //# sourceMappingURL=node.js.map
    });

    var naiveFallback = function () {
    	if (typeof self === "object" && self) return self;
    	if (typeof window === "object" && window) return window;
    	throw new Error("Unable to resolve global `this`");
    };

    var global$2 = (function () {
    	if (this) return this;

    	// Unexpected strict mode (may happen if e.g. bundled into ESM module)

    	// Fallback to standard globalThis if available
    	if (typeof globalThis === "object" && globalThis) return globalThis;

    	// Thanks @mathiasbynens -> https://mathiasbynens.be/notes/globalthis
    	// In all ES5+ engines global object inherits from Object.prototype
    	// (if you approached one that doesn't please report)
    	try {
    		Object.defineProperty(Object.prototype, "__global__", {
    			get: function () { return this; },
    			configurable: true
    		});
    	} catch (error) {
    		// Unfortunate case of updates to Object.prototype being restricted
    		// via preventExtensions, seal or freeze
    		return naiveFallback();
    	}
    	try {
    		// Safari case (window.__global__ works, but __global__ does not)
    		if (!__global__) return naiveFallback();
    		return __global__;
    	} finally {
    		delete Object.prototype.__global__;
    	}
    })();

    var name = "websocket";
    var description = "Websocket Client & Server Library implementing the WebSocket protocol as specified in RFC 6455.";
    var keywords = [
    	"websocket",
    	"websockets",
    	"socket",
    	"networking",
    	"comet",
    	"push",
    	"RFC-6455",
    	"realtime",
    	"server",
    	"client"
    ];
    var author = "Brian McKelvey <theturtle32@gmail.com> (https://github.com/theturtle32)";
    var contributors = [
    	"Iñaki Baz Castillo <ibc@aliax.net> (http://dev.sipdoc.net)"
    ];
    var version$1 = "1.0.34";
    var repository = {
    	type: "git",
    	url: "https://github.com/theturtle32/WebSocket-Node.git"
    };
    var homepage = "https://github.com/theturtle32/WebSocket-Node";
    var engines = {
    	node: ">=4.0.0"
    };
    var dependencies = {
    	bufferutil: "^4.0.1",
    	debug: "^2.2.0",
    	"es5-ext": "^0.10.50",
    	"typedarray-to-buffer": "^3.1.5",
    	"utf-8-validate": "^5.0.2",
    	yaeti: "^0.0.6"
    };
    var devDependencies = {
    	"buffer-equal": "^1.0.0",
    	gulp: "^4.0.2",
    	"gulp-jshint": "^2.0.4",
    	"jshint-stylish": "^2.2.1",
    	jshint: "^2.0.0",
    	tape: "^4.9.1"
    };
    var config = {
    	verbose: false
    };
    var scripts = {
    	test: "tape test/unit/*.js",
    	gulp: "gulp"
    };
    var main = "index";
    var directories = {
    	lib: "./lib"
    };
    var browser$1 = "lib/browser.js";
    var license = "Apache-2.0";
    var require$$0 = {
    	name: name,
    	description: description,
    	keywords: keywords,
    	author: author,
    	contributors: contributors,
    	version: version$1,
    	repository: repository,
    	homepage: homepage,
    	engines: engines,
    	dependencies: dependencies,
    	devDependencies: devDependencies,
    	config: config,
    	scripts: scripts,
    	main: main,
    	directories: directories,
    	browser: browser$1,
    	license: license
    };

    var version = require$$0.version;

    var _globalThis;
    if (typeof globalThis === 'object') {
    	_globalThis = globalThis;
    } else {
    	try {
    		_globalThis = global$2;
    	} catch (error) {
    	} finally {
    		if (!_globalThis && typeof window !== 'undefined') { _globalThis = window; }
    		if (!_globalThis) { throw new Error('Could not determine global this'); }
    	}
    }

    var NativeWebSocket = _globalThis.WebSocket || _globalThis.MozWebSocket;



    /**
     * Expose a W3C WebSocket class with just one or two arguments.
     */
    function W3CWebSocket(uri, protocols) {
    	var native_instance;

    	if (protocols) {
    		native_instance = new NativeWebSocket(uri, protocols);
    	}
    	else {
    		native_instance = new NativeWebSocket(uri);
    	}

    	/**
    	 * 'native_instance' is an instance of nativeWebSocket (the browser's WebSocket
    	 * class). Since it is an Object it will be returned as it is when creating an
    	 * instance of W3CWebSocket via 'new W3CWebSocket()'.
    	 *
    	 * ECMAScript 5: http://bclary.com/2004/11/07/#a-13.2.2
    	 */
    	return native_instance;
    }
    if (NativeWebSocket) {
    	['CONNECTING', 'OPEN', 'CLOSING', 'CLOSED'].forEach(function(prop) {
    		Object.defineProperty(W3CWebSocket, prop, {
    			get: function() { return NativeWebSocket[prop]; }
    		});
    	});
    }

    /**
     * Module exports.
     */
    var browser = {
        'w3cwebsocket' : NativeWebSocket ? W3CWebSocket : null,
        'version'      : version
    };

    var ForOfAdaptor_1 = createCommonjsModule(function (module, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ForOfAdaptor = void 0;
    /**
     * Adaptor for `for ... of` iteration.
     *
     * @author Jeongho Nam - https://github.com/samchon
     */
    var ForOfAdaptor = /** @class */ (function () {
        /**
         * Initializer Constructor.
         *
         * @param first Input iteartor of the first position.
         * @param last Input iterator of the last position.
         */
        function ForOfAdaptor(first, last) {
            this.it_ = first;
            this.last_ = last;
        }
        /**
         * @inheritDoc
         */
        ForOfAdaptor.prototype.next = function () {
            if (this.it_.equals(this.last_))
                return {
                    done: true,
                    value: undefined,
                };
            else {
                var it = this.it_;
                this.it_ = this.it_.next();
                return {
                    done: false,
                    value: it.value,
                };
            }
        };
        /**
         * @inheritDoc
         */
        ForOfAdaptor.prototype[Symbol.iterator] = function () {
            return this;
        };
        return ForOfAdaptor;
    }());
    exports.ForOfAdaptor = ForOfAdaptor;
    //# sourceMappingURL=ForOfAdaptor.js.map
    });

    var Container_1 = createCommonjsModule(function (module, exports) {
    var __values = (commonjsGlobal && commonjsGlobal.__values) || function(o) {
        var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
        if (m) return m.call(o);
        if (o && typeof o.length === "number") return {
            next: function () {
                if (o && i >= o.length) o = void 0;
                return { value: o && o[i++], done: !o };
            }
        };
        throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Container = void 0;

    /**
     * Basic container.
     *
     * @template T Stored elements' type
     * @template SourceT Derived type extending this {@link Container}
     * @template IteratorT Iterator type
     * @template ReverseT Reverse iterator type
     * @template PElem Parent type of *T*, used for inserting elements through {@link assign} and {@link insert}.
     *
     * @author Jeongho Nam - https://github.com/samchon
     */
    var Container = /** @class */ (function () {
        function Container() {
        }
        /**
         * @inheritDoc
         */
        Container.prototype.empty = function () {
            return this.size() === 0;
        };
        /**
         * @inheritDoc
         */
        Container.prototype.rbegin = function () {
            return this.end().reverse();
        };
        /**
         * @inheritDoc
         */
        Container.prototype.rend = function () {
            return this.begin().reverse();
        };
        /**
         * @inheritDoc
         */
        Container.prototype[Symbol.iterator] = function () {
            return new ForOfAdaptor_1.ForOfAdaptor(this.begin(), this.end());
        };
        /**
         * @inheritDoc
         */
        Container.prototype.toJSON = function () {
            var e_1, _a;
            var ret = [];
            try {
                for (var _b = __values(this), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var elem = _c.value;
                    ret.push(elem);
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_1) throw e_1.error; }
            }
            return ret;
        };
        return Container;
    }());
    exports.Container = Container;
    //# sourceMappingURL=Container.js.map
    });

    var NativeArrayIterator_1 = createCommonjsModule(function (module, exports) {
    var __read = (commonjsGlobal && commonjsGlobal.__read) || function (o, n) {
        var m = typeof Symbol === "function" && o[Symbol.iterator];
        if (!m) return o;
        var i = m.call(o), r, ar = [], e;
        try {
            while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
        }
        catch (error) { e = { error: error }; }
        finally {
            try {
                if (r && !r.done && (m = i["return"])) m.call(i);
            }
            finally { if (e) throw e.error; }
        }
        return ar;
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.NativeArrayIterator = void 0;
    var NativeArrayIterator = /** @class */ (function () {
        /* ---------------------------------------------------------
            CONSTRUCTORS
        --------------------------------------------------------- */
        function NativeArrayIterator(data, index) {
            this.data_ = data;
            this.index_ = index;
        }
        /* ---------------------------------------------------------
            ACCESSORS
        --------------------------------------------------------- */
        NativeArrayIterator.prototype.index = function () {
            return this.index_;
        };
        Object.defineProperty(NativeArrayIterator.prototype, "value", {
            get: function () {
                return this.data_[this.index_];
            },
            enumerable: false,
            configurable: true
        });
        /* ---------------------------------------------------------
            MOVERS
        --------------------------------------------------------- */
        NativeArrayIterator.prototype.prev = function () {
            --this.index_;
            return this;
        };
        NativeArrayIterator.prototype.next = function () {
            ++this.index_;
            return this;
        };
        NativeArrayIterator.prototype.advance = function (n) {
            this.index_ += n;
            return this;
        };
        /* ---------------------------------------------------------
            COMPARES
        --------------------------------------------------------- */
        NativeArrayIterator.prototype.equals = function (obj) {
            return this.data_ === obj.data_ && this.index_ === obj.index_;
        };
        NativeArrayIterator.prototype.swap = function (obj) {
            var _a, _b;
            _a = __read([obj.data_, this.data_], 2), this.data_ = _a[0], obj.data_ = _a[1];
            _b = __read([obj.index_, this.index_], 2), this.index_ = _b[0], obj.index_ = _b[1];
        };
        return NativeArrayIterator;
    }());
    exports.NativeArrayIterator = NativeArrayIterator;
    //# sourceMappingURL=NativeArrayIterator.js.map
    });

    var SetContainer_1 = createCommonjsModule(function (module, exports) {
    var __extends = (commonjsGlobal && commonjsGlobal.__extends) || (function () {
        var extendStatics = function (d, b) {
            extendStatics = Object.setPrototypeOf ||
                ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
                function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
            return extendStatics(d, b);
        };
        return function (d, b) {
            if (typeof b !== "function" && b !== null)
                throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
            extendStatics(d, b);
            function __() { this.constructor = d; }
            d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
        };
    })();
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SetContainer = void 0;


    /**
     * Basic set container.
     *
     * @template Key Key type
     * @template Unique Whether duplicated key is blocked or not
     * @template Source Derived type extending this {@link SetContainer}
     * @template IteratorT Iterator type
     * @template ReverseT Reverse iterator type
     *
     * @author Jeongho Nam - https://github.com/samchon
     */
    var SetContainer = /** @class */ (function (_super) {
        __extends(SetContainer, _super);
        /* ---------------------------------------------------------
            CONSTURCTORS
        --------------------------------------------------------- */
        /**
         * Default Constructor.
         */
        function SetContainer(factory) {
            var _this = _super.call(this) || this;
            _this.data_ = factory(_this);
            return _this;
        }
        /**
         * @inheritDoc
         */
        SetContainer.prototype.assign = function (first, last) {
            // INSERT
            this.clear();
            this.insert(first, last);
        };
        /**
         * @inheritDoc
         */
        SetContainer.prototype.clear = function () {
            // TO BE ABSTRACT
            this.data_.clear();
        };
        /**
         * @inheritDoc
         */
        SetContainer.prototype.begin = function () {
            return this.data_.begin();
        };
        /**
         * @inheritDoc
         */
        SetContainer.prototype.end = function () {
            return this.data_.end();
        };
        /* ---------------------------------------------------------
            ELEMENTS
        --------------------------------------------------------- */
        /**
         * @inheritDoc
         */
        SetContainer.prototype.has = function (key) {
            return !this.find(key).equals(this.end());
        };
        /**
         * @inheritDoc
         */
        SetContainer.prototype.size = function () {
            return this.data_.size();
        };
        /* =========================================================
            ELEMENTS I/O
                - INSERT
                - ERASE
                - UTILITY
                - POST-PROCESS
        ============================================================
            INSERT
        --------------------------------------------------------- */
        /**
         * @inheritDoc
         */
        SetContainer.prototype.push = function () {
            var items = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                items[_i] = arguments[_i];
            }
            if (items.length === 0)
                return this.size();
            // INSERT BY RANGE
            var first = new NativeArrayIterator_1.NativeArrayIterator(items, 0);
            var last = new NativeArrayIterator_1.NativeArrayIterator(items, items.length);
            this._Insert_by_range(first, last);
            // RETURN SIZE
            return this.size();
        };
        SetContainer.prototype.insert = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            if (args.length === 1)
                return this._Insert_by_key(args[0]);
            else if (args[0].next instanceof Function &&
                args[1].next instanceof Function)
                return this._Insert_by_range(args[0], args[1]);
            else
                return this._Insert_by_hint(args[0], args[1]);
        };
        SetContainer.prototype.erase = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            if (args.length === 1 &&
                !(args[0] instanceof this.end().constructor &&
                    args[0].source() === this))
                return this._Erase_by_val(args[0]);
            else if (args.length === 1)
                return this._Erase_by_range(args[0]);
            else
                return this._Erase_by_range(args[0], args[1]);
        };
        SetContainer.prototype._Erase_by_range = function (first, last) {
            if (last === void 0) { last = first.next(); }
            // ERASE
            var it = this.data_.erase(first, last);
            // POST-PROCESS
            this._Handle_erase(first, last);
            return it;
        };
        return SetContainer;
    }(Container_1.Container));
    exports.SetContainer = SetContainer;
    //# sourceMappingURL=SetContainer.js.map
    });

    var Exception_1 = createCommonjsModule(function (module, exports) {
    var __extends = (commonjsGlobal && commonjsGlobal.__extends) || (function () {
        var extendStatics = function (d, b) {
            extendStatics = Object.setPrototypeOf ||
                ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
                function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
            return extendStatics(d, b);
        };
        return function (d, b) {
            if (typeof b !== "function" && b !== null)
                throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
            extendStatics(d, b);
            function __() { this.constructor = d; }
            d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
        };
    })();
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Exception = void 0;
    //================================================================
    /**
     * @packageDocumentation
     * @module std
     */
    //================================================================
    /**
     * Base Exception.
     *
     * @author Jeongho Nam - https://github.com/samchon
     */
    var Exception = /** @class */ (function (_super) {
        __extends(Exception, _super);
        /* ---------------------------------------------------------
            CONSTRUCTOR
        --------------------------------------------------------- */
        /**
         * Initializer Constructor.
         *
         * @param message The error messgae.
         */
        function Exception(message) {
            var _newTarget = this.constructor;
            var _this = _super.call(this, message) || this;
            // INHERITANCE POLYFILL
            var proto = _newTarget.prototype;
            if (Object.setPrototypeOf)
                Object.setPrototypeOf(_this, proto);
            else
                _this.__proto__ = proto;
            return _this;
        }
        Object.defineProperty(Exception.prototype, "name", {
            /* ---------------------------------------------------------
                ACCESSORS
            --------------------------------------------------------- */
            /**
             * The error name.
             */
            get: function () {
                return this.constructor.name;
            },
            enumerable: false,
            configurable: true
        });
        /**
         * Get error message.
         *
         * @return The error message.
         */
        Exception.prototype.what = function () {
            return this.message;
        };
        /**
         * Native function for `JSON.stringify()`.
         *
         * The {@link Exception.toJSON} function returns only three properties; ({@link name}, {@link message} and {@link stack}). If you want to define a new sub-class extending the {@link Exception} and const the class to export additional props (or remove some props), override this {@link Exception.toJSON} method.
         *
         * @return An object for `JSON.stringify()`.
         */
        Exception.prototype.toJSON = function () {
            return {
                name: this.name,
                message: this.message,
                stack: this.stack,
            };
        };
        return Exception;
    }(Error));
    exports.Exception = Exception;
    //# sourceMappingURL=Exception.js.map
    });

    var LogicError_1 = createCommonjsModule(function (module, exports) {
    var __extends = (commonjsGlobal && commonjsGlobal.__extends) || (function () {
        var extendStatics = function (d, b) {
            extendStatics = Object.setPrototypeOf ||
                ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
                function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
            return extendStatics(d, b);
        };
        return function (d, b) {
            if (typeof b !== "function" && b !== null)
                throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
            extendStatics(d, b);
            function __() { this.constructor = d; }
            d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
        };
    })();
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.LogicError = void 0;
    //================================================================
    /**
     * @packageDocumentation
     * @module std
     */
    //================================================================

    /**
     * Logic Error.
     *
     * @author Jeongho Nam - https://github.com/samchon
     */
    var LogicError = /** @class */ (function (_super) {
        __extends(LogicError, _super);
        /**
         * Initializer Constructor.
         *
         * @param message The error messgae.
         */
        function LogicError(message) {
            return _super.call(this, message) || this;
        }
        return LogicError;
    }(Exception_1.Exception));
    exports.LogicError = LogicError;
    //# sourceMappingURL=LogicError.js.map
    });

    var InvalidArgument_1 = createCommonjsModule(function (module, exports) {
    var __extends = (commonjsGlobal && commonjsGlobal.__extends) || (function () {
        var extendStatics = function (d, b) {
            extendStatics = Object.setPrototypeOf ||
                ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
                function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
            return extendStatics(d, b);
        };
        return function (d, b) {
            if (typeof b !== "function" && b !== null)
                throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
            extendStatics(d, b);
            function __() { this.constructor = d; }
            d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
        };
    })();
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.InvalidArgument = void 0;
    //================================================================
    /**
     * @packageDocumentation
     * @module std
     */
    //================================================================

    /**
     * Invalid Argument Exception.
     *
     * @author Jeongho Nam - https://github.com/samchon
     */
    var InvalidArgument = /** @class */ (function (_super) {
        __extends(InvalidArgument, _super);
        /**
         * Initializer Constructor.
         *
         * @param message The error messgae.
         */
        function InvalidArgument(message) {
            return _super.call(this, message) || this;
        }
        return InvalidArgument;
    }(LogicError_1.LogicError));
    exports.InvalidArgument = InvalidArgument;
    //# sourceMappingURL=InvalidArgument.js.map
    });

    var OutOfRange_1 = createCommonjsModule(function (module, exports) {
    var __extends = (commonjsGlobal && commonjsGlobal.__extends) || (function () {
        var extendStatics = function (d, b) {
            extendStatics = Object.setPrototypeOf ||
                ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
                function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
            return extendStatics(d, b);
        };
        return function (d, b) {
            if (typeof b !== "function" && b !== null)
                throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
            extendStatics(d, b);
            function __() { this.constructor = d; }
            d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
        };
    })();
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.OutOfRange = void 0;
    //================================================================
    /**
     * @packageDocumentation
     * @module std
     */
    //================================================================

    /**
     * Out-of-range Exception.
     *
     * @author Jeongho Nam - https://github.com/samchon
     */
    var OutOfRange = /** @class */ (function (_super) {
        __extends(OutOfRange, _super);
        /**
         * Initializer Constructor.
         *
         * @param message The error messgae.
         */
        function OutOfRange(message) {
            return _super.call(this, message) || this;
        }
        return OutOfRange;
    }(LogicError_1.LogicError));
    exports.OutOfRange = OutOfRange;
    //# sourceMappingURL=OutOfRange.js.map
    });

    var ErrorGenerator_1 = createCommonjsModule(function (module, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ErrorGenerator = void 0;
    (function (ErrorGenerator) {
        /* ---------------------------------------------------------
            COMMON
        --------------------------------------------------------- */
        function get_class_name(instance) {
            if (typeof instance === "string")
                return instance;
            var ret = instance.constructor.name;
            if (instance.constructor.__MODULE)
                ret = "".concat(instance.constructor.__MODULE, ".").concat(ret);
            return "std.".concat(ret);
        }
        ErrorGenerator.get_class_name = get_class_name;
        /* ---------------------------------------------------------
            CONTAINERS
        --------------------------------------------------------- */
        function empty(instance, method) {
            return new OutOfRange_1.OutOfRange("Error on ".concat(get_class_name(instance), ".").concat(method, "(): it's empty container."));
        }
        ErrorGenerator.empty = empty;
        function negative_index(instance, method, index) {
            return new OutOfRange_1.OutOfRange("Error on ".concat(get_class_name(instance), ".").concat(method, "(): parametric index is negative -> (index = ").concat(index, ")."));
        }
        ErrorGenerator.negative_index = negative_index;
        function excessive_index(instance, method, index, size) {
            return new OutOfRange_1.OutOfRange("Error on ".concat(get_class_name(instance), ".").concat(method, "(): parametric index is equal or greater than size -> (index = ").concat(index, ", size: ").concat(size, ")."));
        }
        ErrorGenerator.excessive_index = excessive_index;
        function not_my_iterator(instance, method) {
            return new InvalidArgument_1.InvalidArgument("Error on ".concat(get_class_name(instance), ".").concat(method, "(): parametric iterator is not this container's own."));
        }
        ErrorGenerator.not_my_iterator = not_my_iterator;
        function erased_iterator(instance, method) {
            return new InvalidArgument_1.InvalidArgument("Error on ".concat(get_class_name(instance), ".").concat(method, "(): parametric iterator, it already has been erased."));
        }
        ErrorGenerator.erased_iterator = erased_iterator;
        function negative_iterator(instance, method, index) {
            return new OutOfRange_1.OutOfRange("Error on ".concat(get_class_name(instance), ".").concat(method, "(): parametric iterator is directing negative position -> (index = ").concat(index, ")."));
        }
        ErrorGenerator.negative_iterator = negative_iterator;
        function iterator_end_value(instance, method) {
            if (method === void 0) { method = "end"; }
            var className = get_class_name(instance);
            return new OutOfRange_1.OutOfRange("Error on ".concat(className, ".Iterator.value: cannot access to the ").concat(className, ".").concat(method, "().value."));
        }
        ErrorGenerator.iterator_end_value = iterator_end_value;
        function key_nout_found(instance, method, key) {
            throw new OutOfRange_1.OutOfRange("Error on ".concat(get_class_name(instance), ".").concat(method, "(): unable to find the matched key -> ").concat(key));
        }
        ErrorGenerator.key_nout_found = key_nout_found;
    })(exports.ErrorGenerator || (exports.ErrorGenerator = {}));
    //# sourceMappingURL=ErrorGenerator.js.map
    });

    var UniqueSet_1 = createCommonjsModule(function (module, exports) {
    var __extends = (commonjsGlobal && commonjsGlobal.__extends) || (function () {
        var extendStatics = function (d, b) {
            extendStatics = Object.setPrototypeOf ||
                ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
                function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
            return extendStatics(d, b);
        };
        return function (d, b) {
            if (typeof b !== "function" && b !== null)
                throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
            extendStatics(d, b);
            function __() { this.constructor = d; }
            d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
        };
    })();
    var __read = (commonjsGlobal && commonjsGlobal.__read) || function (o, n) {
        var m = typeof Symbol === "function" && o[Symbol.iterator];
        if (!m) return o;
        var i = m.call(o), r, ar = [], e;
        try {
            while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
        }
        catch (error) { e = { error: error }; }
        finally {
            try {
                if (r && !r.done && (m = i["return"])) m.call(i);
            }
            finally { if (e) throw e.error; }
        }
        return ar;
    };
    var __spreadArray = (commonjsGlobal && commonjsGlobal.__spreadArray) || function (to, from, pack) {
        if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
            if (ar || !(i in from)) {
                if (!ar) ar = Array.prototype.slice.call(from, 0, i);
                ar[i] = from[i];
            }
        }
        return to.concat(ar || Array.prototype.slice.call(from));
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.UniqueSet = void 0;
    //================================================================
    /**
     * @packageDocumentation
     * @module std.base
     */
    //================================================================


    /**
     * Basic set container blocking duplicated key.
     *
     * @template Key Key type
     * @template Source Derived type extending this {@link UniqueSet}
     * @template IteratorT Iterator type
     * @template ReverseT Reverse iterator type
     *
     * @author Jeongho Nam - https://github.com/samchon
     */
    var UniqueSet = /** @class */ (function (_super) {
        __extends(UniqueSet, _super);
        function UniqueSet() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        /* ---------------------------------------------------------
            ACCESSOR
        --------------------------------------------------------- */
        /**
         * @inheritDoc
         */
        UniqueSet.prototype.count = function (key) {
            return this.find(key).equals(this.end()) ? 0 : 1;
        };
        UniqueSet.prototype.insert = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            return _super.prototype.insert.apply(this, __spreadArray([], __read(args), false));
        };
        UniqueSet.prototype._Insert_by_range = function (first, last) {
            for (; !first.equals(last); first = first.next())
                this._Insert_by_key(first.value);
        };
        UniqueSet.prototype.extract = function (param) {
            if (param instanceof this.end().constructor)
                return this._Extract_by_iterator(param);
            else
                return this._Extract_by_val(param);
        };
        UniqueSet.prototype._Extract_by_val = function (key) {
            var it = this.find(key);
            if (it.equals(this.end()) === true)
                throw ErrorGenerator_1.ErrorGenerator.key_nout_found(this, "extract", key);
            this._Erase_by_range(it);
            return key;
        };
        UniqueSet.prototype._Extract_by_iterator = function (it) {
            if (it.equals(this.end()) === true || this.has(it.value) === false)
                return this.end();
            this._Erase_by_range(it);
            return it;
        };
        UniqueSet.prototype._Erase_by_val = function (key) {
            var it = this.find(key);
            if (it.equals(this.end()) === true)
                return 0;
            this._Erase_by_range(it);
            return 1;
        };
        /* ---------------------------------------------------------
            UTILITY
        --------------------------------------------------------- */
        /**
         * @inheritDoc
         */
        UniqueSet.prototype.merge = function (source) {
            for (var it = source.begin(); !it.equals(source.end());) {
                if (this.has(it.value) === false) {
                    this.insert(it.value);
                    it = source.erase(it);
                }
                else
                    it = it.next();
            }
        };
        return UniqueSet;
    }(SetContainer_1.SetContainer));
    exports.UniqueSet = UniqueSet;
    //# sourceMappingURL=UniqueSet.js.map
    });

    var IAssociativeContainer_1 = createCommonjsModule(function (module, exports) {
    var __read = (commonjsGlobal && commonjsGlobal.__read) || function (o, n) {
        var m = typeof Symbol === "function" && o[Symbol.iterator];
        if (!m) return o;
        var i = m.call(o), r, ar = [], e;
        try {
            while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
        }
        catch (error) { e = { error: error }; }
        finally {
            try {
                if (r && !r.done && (m = i["return"])) m.call(i);
            }
            finally { if (e) throw e.error; }
        }
        return ar;
    };
    var __spreadArray = (commonjsGlobal && commonjsGlobal.__spreadArray) || function (to, from, pack) {
        if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
            if (ar || !(i in from)) {
                if (!ar) ar = Array.prototype.slice.call(from, 0, i);
                ar[i] = from[i];
            }
        }
        return to.concat(ar || Array.prototype.slice.call(from));
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.IAssociativeContainer = void 0;
    (function (IAssociativeContainer) {
        /**
         * @internal
         */
        function construct(source) {
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            var ramda;
            var tail;
            if (args.length >= 1 && args[0] instanceof Array) {
                // INITIALIZER LIST CONSTRUCTOR
                ramda = function () {
                    var items = args[0];
                    source.push.apply(source, __spreadArray([], __read(items), false));
                };
                tail = args.slice(1);
            }
            else if (args.length >= 2 &&
                args[0].next instanceof Function &&
                args[1].next instanceof Function) {
                // RANGE CONSTRUCTOR
                ramda = function () {
                    var first = args[0];
                    var last = args[1];
                    source.assign(first, last);
                };
                tail = args.slice(2);
            }
            else {
                // DEFAULT CONSTRUCTOR
                ramda = null;
                tail = args;
            }
            return { ramda: ramda, tail: tail };
        }
        IAssociativeContainer.construct = construct;
    })(exports.IAssociativeContainer || (exports.IAssociativeContainer = {}));
    //# sourceMappingURL=IAssociativeContainer.js.map
    });

    var Global = createCommonjsModule(function (module, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports._Get_root = void 0;
    //================================================================
    /**
     * @packageDocumentation
     * @module std.internal
     */
    //================================================================

    /**
     * @internal
     */
    function _Get_root() {
        if (__s_pRoot === null) {
            __s_pRoot = ((0, node.is_node)() ? commonjsGlobal : self);
            if (__s_pRoot.__s_iUID === undefined)
                __s_pRoot.__s_iUID = 0;
        }
        return __s_pRoot;
    }
    exports._Get_root = _Get_root;
    /**
     * @internal
     */
    var __s_pRoot = null;
    //# sourceMappingURL=Global.js.map
    });

    var uid = createCommonjsModule(function (module, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.get_uid = void 0;
    //================================================================
    /**
     * @packageDocumentation
     * @module std
     */
    //================================================================

    /**
     * Get unique identifier.
     *
     * @param obj Target object.
     * @return The identifier number.
     */
    function get_uid(obj) {
        // NO UID EXISTS, THEN ISSUE ONE.
        if (obj instanceof Object) {
            if (obj.hasOwnProperty("__get_m_iUID") === false) {
                var uid_1 = ++(0, Global._Get_root)().__s_iUID;
                Object.defineProperty(obj, "__get_m_iUID", {
                    value: function () {
                        return uid_1;
                    },
                });
            }
            // RETURNS
            return obj.__get_m_iUID();
        }
        else if (obj === undefined)
            return -1;
        // is null
        else
            return 0;
    }
    exports.get_uid = get_uid;
    //# sourceMappingURL=uid.js.map
    });

    var hash_1 = createCommonjsModule(function (module, exports) {
    var __values = (commonjsGlobal && commonjsGlobal.__values) || function(o) {
        var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
        if (m) return m.call(o);
        if (o && typeof o.length === "number") return {
            next: function () {
                if (o && i >= o.length) o = void 0;
                return { value: o && o[i++], done: !o };
            }
        };
        throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.hash = void 0;

    /**
     * Hash function.
     *
     * @param itemList The items to be hashed.
     * @return The hash code.
     */
    function hash() {
        var e_1, _a;
        var itemList = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            itemList[_i] = arguments[_i];
        }
        var ret = INIT_VALUE;
        try {
            for (var itemList_1 = __values(itemList), itemList_1_1 = itemList_1.next(); !itemList_1_1.done; itemList_1_1 = itemList_1.next()) {
                var item = itemList_1_1.value;
                item = item ? item.valueOf() : item;
                var type = typeof item;
                if (type === "boolean")
                    // BOOLEAN -> 1 BYTE
                    ret = _Hash_boolean(item, ret);
                else if (type === "number" || type === "bigint")
                    // NUMBER -> 8 BYTES
                    ret = _Hash_number(item, ret);
                else if (type === "string")
                    // STRING -> {LENGTH} BYTES
                    ret = _Hash_string(item, ret);
                else if (item instanceof Object &&
                    item.hashCode instanceof Function) {
                    var hashed = item.hashCode();
                    if (itemList.length === 1)
                        return hashed;
                    else {
                        ret = ret ^ hashed;
                        ret *= MULTIPLIER;
                    }
                } // object | null | undefined
                else
                    ret = _Hash_number((0, uid.get_uid)(item), ret);
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (itemList_1_1 && !itemList_1_1.done && (_a = itemList_1.return)) _a.call(itemList_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        return Math.abs(ret);
    }
    exports.hash = hash;
    function _Hash_boolean(val, ret) {
        ret ^= val ? 1 : 0;
        ret *= MULTIPLIER;
        return ret;
    }
    function _Hash_number(val, ret) {
        return _Hash_string(val.toString(), ret);
        // // ------------------------------------------
        // //    IN C++
        // //        CONSIDER A NUMBER AS A STRING
        // //        HASH<STRING>((CHAR*)&VAL, 8)
        // // ------------------------------------------
        // // CONSTRUCT BUFFER AND BYTE_ARRAY
        // const buffer: ArrayBuffer = new ArrayBuffer(8);
        // const byteArray: Int8Array = new Int8Array(buffer);
        // const valueArray: Float64Array = new Float64Array(buffer);
        // valueArray[0] = val;
        // for (let i: number = 0; i < byteArray.length; ++i)
        // {
        //     const byte = (byteArray[i] < 0) ? byteArray[i] + 256 : byteArray[i];
        //     ret ^= byte;
        //     ret *= _HASH_MULTIPLIER;
        // }
        // return Math.abs(ret);
    }
    function _Hash_string(str, ret) {
        for (var i = 0; i < str.length; ++i) {
            ret ^= str.charCodeAt(i);
            ret *= MULTIPLIER;
        }
        return Math.abs(ret);
    }
    /* ---------------------------------------------------------
        RESERVED ITEMS
    --------------------------------------------------------- */
    var INIT_VALUE = 2166136261;
    var MULTIPLIER = 16777619;
    //# sourceMappingURL=hash.js.map
    });

    var comparators = createCommonjsModule(function (module, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.greater_equal = exports.greater = exports.less_equal = exports.less = exports.not_equal_to = exports.equal_to = void 0;

    /**
     * Test whether two arguments are equal.
     *
     * @param x The first argument to compare.
     * @param y The second argument to compare.
     * @return Whether two arguments are equal or not.
     */
    function equal_to(x, y) {
        // CONVERT TO PRIMITIVE TYPE
        x = x ? x.valueOf() : x;
        y = y ? y.valueOf() : y;
        // DO COMPARE
        if (x instanceof Object &&
            x.equals instanceof Function)
            return x.equals(y);
        else
            return x === y;
    }
    exports.equal_to = equal_to;
    /**
     * Test whether two arguments are not equal.
     *
     * @param x The first argument to compare.
     * @param y The second argument to compare.
     * @return Returns `true`, if two arguments are not equal, otherwise `false`.
     */
    function not_equal_to(x, y) {
        return !equal_to(x, y);
    }
    exports.not_equal_to = not_equal_to;
    /**
     * Test whether *x* is less than *y*.
     *
     * @param x The first argument to compare.
     * @param y The second argument to compare.
     * @return Whether *x* is less than *y*.
     */
    function less(x, y) {
        // CONVERT TO PRIMITIVE TYPE
        x = x.valueOf();
        y = y.valueOf();
        // DO COMPARE
        if (x instanceof Object)
            if (x.less instanceof Function)
                // has less()
                return x.less(y);
            else
                return (0, uid.get_uid)(x) < (0, uid.get_uid)(y);
        else
            return x < y;
    }
    exports.less = less;
    /**
     * Test whether *x* is less than or equal to *y*.
     *
     * @param x The first argument to compare.
     * @param y The second argument to compare.
     * @return Whether *x* is less than or equal to *y*.
     */
    function less_equal(x, y) {
        return less(x, y) || equal_to(x, y);
    }
    exports.less_equal = less_equal;
    /**
     * Test whether *x* is greater than *y*.
     *
     * @param x The first argument to compare.
     * @param y The second argument to compare.
     * @return Whether *x* is greater than *y*.
     */
    function greater(x, y) {
        return !less_equal(x, y);
    }
    exports.greater = greater;
    /**
     * Test whether *x* is greater than or equal to *y*.
     *
     * @param x The first argument to compare.
     * @param y The second argument to compare.
     * @return Whether *x* is greater than or equal to *y*.
     */
    function greater_equal(x, y) {
        return !less(x, y);
    }
    exports.greater_equal = greater_equal;
    //# sourceMappingURL=comparators.js.map
    });

    var IHashContainer_1 = createCommonjsModule(function (module, exports) {
    var __read = (commonjsGlobal && commonjsGlobal.__read) || function (o, n) {
        var m = typeof Symbol === "function" && o[Symbol.iterator];
        if (!m) return o;
        var i = m.call(o), r, ar = [], e;
        try {
            while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
        }
        catch (error) { e = { error: error }; }
        finally {
            try {
                if (r && !r.done && (m = i["return"])) m.call(i);
            }
            finally { if (e) throw e.error; }
        }
        return ar;
    };
    var __spreadArray = (commonjsGlobal && commonjsGlobal.__spreadArray) || function (to, from, pack) {
        if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
            if (ar || !(i in from)) {
                if (!ar) ar = Array.prototype.slice.call(from, 0, i);
                ar[i] = from[i];
            }
        }
        return to.concat(ar || Array.prototype.slice.call(from));
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.IHashContainer = void 0;
    (function (IHashContainer) {
        /**
         * @internal
         */
        function construct(source, Source, bucketFactory) {
            var args = [];
            for (var _i = 3; _i < arguments.length; _i++) {
                args[_i - 3] = arguments[_i];
            }
            // DECLARE MEMBERS
            var post_process = null;
            var hash_function = hash_1.hash;
            var key_eq = comparators.equal_to;
            //----
            // INITIALIZE MEMBERS AND POST-PROCESS
            //----
            // BRANCH - METHOD OVERLOADINGS
            if (args.length === 1 && args[0] instanceof Source) {
                // PARAMETERS
                var container_1 = args[0];
                hash_function = container_1.hash_function();
                key_eq = container_1.key_eq();
                // COPY CONSTRUCTOR
                post_process = function () {
                    var first = container_1.begin();
                    var last = container_1.end();
                    source.assign(first, last);
                };
            }
            else {
                var tuple = IAssociativeContainer_1.IAssociativeContainer.construct.apply(IAssociativeContainer_1.IAssociativeContainer, __spreadArray([source], __read(args), false));
                post_process = tuple.ramda;
                if (tuple.tail.length >= 1)
                    hash_function = tuple.tail[0];
                if (tuple.tail.length >= 2)
                    key_eq = tuple.tail[1];
            }
            //----
            // DO PROCESS
            //----
            // CONSTRUCT BUCKET
            bucketFactory(hash_function, key_eq);
            // ACT POST-PROCESS
            if (post_process !== null)
                post_process();
        }
        IHashContainer.construct = construct;
    })(exports.IHashContainer || (exports.IHashContainer = {}));
    //# sourceMappingURL=IHashContainer.js.map
    });

    var ListIterator_1 = createCommonjsModule(function (module, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ListIterator = void 0;

    /**
     * Basic List Iterator.
     *
     * @author Jeongho Nam - https://github.com/samchon
     */
    var ListIterator = /** @class */ (function () {
        /* ---------------------------------------------------------------
            CONSTRUCTORS
        --------------------------------------------------------------- */
        function ListIterator(prev, next, value) {
            this.prev_ = prev;
            this.next_ = next;
            this.value_ = value;
        }
        /**
         * @internal
         */
        ListIterator._Set_prev = function (it, prev) {
            it.prev_ = prev;
        };
        /**
         * @internal
         */
        ListIterator._Set_next = function (it, next) {
            it.next_ = next;
        };
        /**
         * @inheritDoc
         */
        ListIterator.prototype.prev = function () {
            return this.prev_;
        };
        /**
         * @inheritDoc
         */
        ListIterator.prototype.next = function () {
            return this.next_;
        };
        Object.defineProperty(ListIterator.prototype, "value", {
            /**
             * @inheritDoc
             */
            get: function () {
                this._Try_value();
                return this.value_;
            },
            enumerable: false,
            configurable: true
        });
        ListIterator.prototype._Try_value = function () {
            if (this.value_ === undefined &&
                this.equals(this.source().end()) === true)
                throw ErrorGenerator_1.ErrorGenerator.iterator_end_value(this.source());
        };
        /* ---------------------------------------------------------------
            COMPARISON
        --------------------------------------------------------------- */
        /**
         * @inheritDoc
         */
        ListIterator.prototype.equals = function (obj) {
            return this === obj;
        };
        return ListIterator;
    }());
    exports.ListIterator = ListIterator;
    //# sourceMappingURL=ListIterator.js.map
    });

    var Repeater_1 = createCommonjsModule(function (module, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Repeater = void 0;
    var Repeater = /** @class */ (function () {
        /* ---------------------------------------------------------
            CONSTRUCTORS
        --------------------------------------------------------- */
        function Repeater(index, value) {
            this.index_ = index;
            this.value_ = value;
        }
        /* ---------------------------------------------------------
            ACCESSORS
        --------------------------------------------------------- */
        Repeater.prototype.index = function () {
            return this.index_;
        };
        Object.defineProperty(Repeater.prototype, "value", {
            get: function () {
                return this.value_;
            },
            enumerable: false,
            configurable: true
        });
        /* ---------------------------------------------------------
            MOVERS & COMPARE
        --------------------------------------------------------- */
        Repeater.prototype.next = function () {
            ++this.index_;
            return this;
        };
        Repeater.prototype.equals = function (obj) {
            return this.index_ === obj.index_;
        };
        return Repeater;
    }());
    exports.Repeater = Repeater;
    //# sourceMappingURL=Repeater.js.map
    });

    var global$1 = createCommonjsModule(function (module, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.next = exports.prev = exports.advance = exports.distance = exports.size = exports.empty = void 0;

    /* =========================================================
        GLOBAL FUNCTIONS
            - ACCESSORS
            - MOVERS
            - FACTORIES
    ============================================================
        ACCESSORS
    --------------------------------------------------------- */
    /**
     * Test whether a container is empty.
     *
     * @param source Target container.
     * @return Whether empty or not.
     */
    function empty(source) {
        if (source instanceof Array)
            return source.length !== 0;
        else
            return source.empty();
    }
    exports.empty = empty;
    /**
     * Get number of elements of a container.
     *
     * @param source Target container.
     * @return The number of elements in the container.
     */
    function size(source) {
        if (source instanceof Array)
            return source.length;
        else
            return source.size();
    }
    exports.size = size;
    function distance(first, last) {
        if (first.index instanceof Function)
            return _Distance_via_index(first, last);
        var ret = 0;
        for (; !first.equals(last); first = first.next())
            ++ret;
        return ret;
    }
    exports.distance = distance;
    function _Distance_via_index(first, last) {
        var x = first.index();
        var y = last.index();
        if (first.base instanceof Function)
            return x - y;
        else
            return y - x;
    }
    function advance(it, n) {
        if (n === 0)
            return it;
        else if (it.advance instanceof Function)
            return it.advance(n);
        var stepper;
        if (n < 0) {
            if (!(it.prev instanceof Function))
                throw new InvalidArgument_1.InvalidArgument("Error on std.advance(): parametric iterator is not a bi-directional iterator, thus advancing to negative direction is not possible.");
            stepper = function (it) { return it.prev(); };
            n = -n;
        }
        else
            stepper = function (it) { return it.next(); };
        while (n-- > 0)
            it = stepper(it);
        return it;
    }
    exports.advance = advance;
    /**
     * Get previous iterator.
     *
     * @param it Iterator to move.
     * @param n Step to move prev.
     * @return An iterator moved to prev *n* steps.
     */
    function prev(it, n) {
        if (n === void 0) { n = 1; }
        if (n === 1)
            return it.prev();
        else
            return advance(it, -n);
    }
    exports.prev = prev;
    /**
     * Get next iterator.
     *
     * @param it Iterator to move.
     * @param n Step to move next.
     * @return Iterator moved to next *n* steps.
     */
    function next(it, n) {
        if (n === void 0) { n = 1; }
        if (n === 1)
            return it.next();
        else
            return advance(it, n);
    }
    exports.next = next;
    //# sourceMappingURL=global.js.map
    });

    var ListContainer_1 = createCommonjsModule(function (module, exports) {
    var __extends = (commonjsGlobal && commonjsGlobal.__extends) || (function () {
        var extendStatics = function (d, b) {
            extendStatics = Object.setPrototypeOf ||
                ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
                function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
            return extendStatics(d, b);
        };
        return function (d, b) {
            if (typeof b !== "function" && b !== null)
                throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
            extendStatics(d, b);
            function __() { this.constructor = d; }
            d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
        };
    })();
    var __read = (commonjsGlobal && commonjsGlobal.__read) || function (o, n) {
        var m = typeof Symbol === "function" && o[Symbol.iterator];
        if (!m) return o;
        var i = m.call(o), r, ar = [], e;
        try {
            while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
        }
        catch (error) { e = { error: error }; }
        finally {
            try {
                if (r && !r.done && (m = i["return"])) m.call(i);
            }
            finally { if (e) throw e.error; }
        }
        return ar;
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ListContainer = void 0;






    /**
     * Basic List Container.
     *
     * @author Jeongho Nam - https://github.com/samchon
     */
    var ListContainer = /** @class */ (function (_super) {
        __extends(ListContainer, _super);
        /* ---------------------------------------------------------
            CONSTRUCTORS
        --------------------------------------------------------- */
        /**
         * Default Constructor.
         */
        function ListContainer() {
            var _this = _super.call(this) || this;
            // INIT MEMBERS
            _this.end_ = _this._Create_iterator(null, null);
            _this.clear();
            return _this;
        }
        ListContainer.prototype.assign = function (par1, par2) {
            this.clear();
            this.insert(this.end(), par1, par2);
        };
        /**
         * @inheritDoc
         */
        ListContainer.prototype.clear = function () {
            // DISCONNECT NODES
            ListIterator_1.ListIterator._Set_prev(this.end_, this.end_);
            ListIterator_1.ListIterator._Set_next(this.end_, this.end_);
            // RE-SIZE -> 0
            this.begin_ = this.end_;
            this.size_ = 0;
        };
        /**
         * @inheritDoc
         */
        ListContainer.prototype.resize = function (n) {
            var expansion = n - this.size();
            if (expansion > 0)
                this.insert(this.end(), expansion, undefined);
            else if (expansion < 0)
                this.erase((0, global$1.advance)(this.end(), -expansion), this.end());
        };
        /* ---------------------------------------------------------
            ACCESSORS
        --------------------------------------------------------- */
        /**
         * @inheritDoc
         */
        ListContainer.prototype.begin = function () {
            return this.begin_;
        };
        /**
         * @inheritDoc
         */
        ListContainer.prototype.end = function () {
            return this.end_;
        };
        /**
         * @inheritDoc
         */
        ListContainer.prototype.size = function () {
            return this.size_;
        };
        /* =========================================================
            ELEMENTS I/O
                - PUSH & POP
                - INSERT
                - ERASE
                - POST-PROCESS
        ============================================================
            PUSH & POP
        --------------------------------------------------------- */
        /**
         * @inheritDoc
         */
        ListContainer.prototype.push_front = function (val) {
            this.insert(this.begin_, val);
        };
        /**
         * @inheritDoc
         */
        ListContainer.prototype.push_back = function (val) {
            this.insert(this.end_, val);
        };
        /**
         * @inheritDoc
         */
        ListContainer.prototype.pop_front = function () {
            if (this.empty() === true)
                throw ErrorGenerator_1.ErrorGenerator.empty(this.end_.source().constructor.name, "pop_front");
            this.erase(this.begin_);
        };
        /**
         * @inheritDoc
         */
        ListContainer.prototype.pop_back = function () {
            if (this.empty() === true)
                throw ErrorGenerator_1.ErrorGenerator.empty(this.end_.source().constructor.name, "pop_back");
            this.erase(this.end_.prev());
        };
        /* ---------------------------------------------------------
            INSERT
        --------------------------------------------------------- */
        /**
         * @inheritDoc
         */
        ListContainer.prototype.push = function () {
            var items = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                items[_i] = arguments[_i];
            }
            if (items.length === 0)
                return this.size();
            // INSERT BY RANGE
            var first = new NativeArrayIterator_1.NativeArrayIterator(items, 0);
            var last = new NativeArrayIterator_1.NativeArrayIterator(items, items.length);
            this._Insert_by_range(this.end(), first, last);
            // RETURN SIZE
            return this.size();
        };
        ListContainer.prototype.insert = function (pos) {
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            // VALIDATION
            if (pos.source() !== this.end_.source())
                throw ErrorGenerator_1.ErrorGenerator.not_my_iterator(this.end_.source(), "insert");
            else if (pos.erased_ === true)
                throw ErrorGenerator_1.ErrorGenerator.erased_iterator(this.end_.source(), "insert");
            // BRANCHES
            if (args.length === 1)
                return this._Insert_by_repeating_val(pos, 1, args[0]);
            else if (args.length === 2 && typeof args[0] === "number")
                return this._Insert_by_repeating_val(pos, args[0], args[1]);
            else
                return this._Insert_by_range(pos, args[0], args[1]);
        };
        ListContainer.prototype._Insert_by_repeating_val = function (position, n, val) {
            var first = new Repeater_1.Repeater(0, val);
            var last = new Repeater_1.Repeater(n);
            return this._Insert_by_range(position, first, last);
        };
        ListContainer.prototype._Insert_by_range = function (position, begin, end) {
            var prev = position.prev();
            var first = null;
            var size = 0;
            for (var it = begin; it.equals(end) === false; it = it.next()) {
                // CONSTRUCT ITEM, THE NEW ELEMENT
                var item = this._Create_iterator(prev, null, it.value);
                if (size === 0)
                    first = item;
                // PLACE ITEM ON THE NEXT OF "PREV"
                ListIterator_1.ListIterator._Set_next(prev, item);
                // SHIFT CURRENT ITEM TO PREVIOUS
                prev = item;
                ++size;
            }
            // WILL FIRST BE THE BEGIN?
            if (position.equals(this.begin()) === true)
                this.begin_ = first;
            // CONNECT BETWEEN LAST AND POSITION
            ListIterator_1.ListIterator._Set_next(prev, position);
            ListIterator_1.ListIterator._Set_prev(position, prev);
            this.size_ += size;
            return first;
        };
        ListContainer.prototype.erase = function (first, last) {
            if (last === void 0) { last = first.next(); }
            return this._Erase_by_range(first, last);
        };
        ListContainer.prototype._Erase_by_range = function (first, last) {
            // VALIDATION
            if (first.source() !== this.end_.source())
                throw ErrorGenerator_1.ErrorGenerator.not_my_iterator(this.end_.source(), "insert");
            else if (first.erased_ === true)
                throw ErrorGenerator_1.ErrorGenerator.erased_iterator(this.end_.source(), "insert");
            else if (first.equals(this.end_))
                return this.end_;
            // FIND PREV AND NEXT
            var prev = first.prev();
            // SHRINK
            ListIterator_1.ListIterator._Set_next(prev, last);
            ListIterator_1.ListIterator._Set_prev(last, prev);
            for (var it = first; !it.equals(last); it = it.next()) {
                it.erased_ = true;
                --this.size_;
            }
            if (first.equals(this.begin_))
                this.begin_ = last;
            return last;
        };
        /* ---------------------------------------------------------
            SWAP
        --------------------------------------------------------- */
        /**
         * @inheritDoc
         */
        ListContainer.prototype.swap = function (obj) {
            var _a, _b, _c;
            _a = __read([obj.begin_, this.begin_], 2), this.begin_ = _a[0], obj.begin_ = _a[1];
            _b = __read([obj.end_, this.end_], 2), this.end_ = _b[0], obj.end_ = _b[1];
            _c = __read([obj.size_, this.size_], 2), this.size_ = _c[0], obj.size_ = _c[1];
        };
        return ListContainer;
    }(Container_1.Container));
    exports.ListContainer = ListContainer;
    //# sourceMappingURL=ListContainer.js.map
    });

    var ReverseIterator_1 = createCommonjsModule(function (module, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ReverseIterator = void 0;
    /**
     * Basic reverse iterator.
     *
     * @author Jeongho Nam - https://github.com/samchon
     */
    var ReverseIterator = /** @class */ (function () {
        /* ---------------------------------------------------------
            CONSTRUCTORS
        --------------------------------------------------------- */
        /**
         * Initializer Constructor.
         *
         * @param base The base iterator.
         */
        function ReverseIterator(base) {
            this.base_ = base.prev();
        }
        /* ---------------------------------------------------------
            ACCESSORS
        --------------------------------------------------------- */
        /**
         * Get source container.
         *
         * @return The source container.
         */
        ReverseIterator.prototype.source = function () {
            return this.base_.source();
        };
        /**
         * @inheritDoc
         */
        ReverseIterator.prototype.base = function () {
            return this.base_.next();
        };
        Object.defineProperty(ReverseIterator.prototype, "value", {
            /**
             * @inheritDoc
             */
            get: function () {
                return this.base_.value;
            },
            enumerable: false,
            configurable: true
        });
        /* ---------------------------------------------------------
            MOVERS
        --------------------------------------------------------- */
        /**
         * @inheritDoc
         */
        ReverseIterator.prototype.prev = function () {
            // this.base().next()
            return this._Create_neighbor(this.base().next());
        };
        /**
         * @inheritDoc
         */
        ReverseIterator.prototype.next = function () {
            // this.base().prev()
            return this._Create_neighbor(this.base_);
        };
        /* ---------------------------------------------------------
            COMPARES
        --------------------------------------------------------- */
        /**
         * @inheritDoc
         */
        ReverseIterator.prototype.equals = function (obj) {
            return this.base_.equals(obj.base_);
        };
        return ReverseIterator;
    }());
    exports.ReverseIterator = ReverseIterator;
    //# sourceMappingURL=ReverseIterator.js.map
    });

    var SetElementList_1 = createCommonjsModule(function (module, exports) {
    var __extends = (commonjsGlobal && commonjsGlobal.__extends) || (function () {
        var extendStatics = function (d, b) {
            extendStatics = Object.setPrototypeOf ||
                ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
                function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
            return extendStatics(d, b);
        };
        return function (d, b) {
            if (typeof b !== "function" && b !== null)
                throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
            extendStatics(d, b);
            function __() { this.constructor = d; }
            d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
        };
    })();
    var __read = (commonjsGlobal && commonjsGlobal.__read) || function (o, n) {
        var m = typeof Symbol === "function" && o[Symbol.iterator];
        if (!m) return o;
        var i = m.call(o), r, ar = [], e;
        try {
            while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
        }
        catch (error) { e = { error: error }; }
        finally {
            try {
                if (r && !r.done && (m = i["return"])) m.call(i);
            }
            finally { if (e) throw e.error; }
        }
        return ar;
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SetElementList = void 0;
    //================================================================
    /**
     * @packageDocumentation
     * @module std.internal
     */
    //================================================================



    /**
     * Doubly Linked List storing set elements.
     *
     * @template Key Key type
     * @template Unique Whether duplicated key is blocked or not
     * @template Source Source container type
     *
     * @author Jeongho Nam - https://github.com/samchon
     */
    var SetElementList = /** @class */ (function (_super) {
        __extends(SetElementList, _super);
        /* ---------------------------------------------------------
            CONSTRUCTORS
        --------------------------------------------------------- */
        function SetElementList(associative) {
            var _this = _super.call(this) || this;
            _this.associative_ = associative;
            return _this;
        }
        SetElementList.prototype._Create_iterator = function (prev, next, val) {
            return SetElementList.Iterator.create(this, prev, next, val);
        };
        /**
         * @internal
         */
        SetElementList._Swap_associative = function (x, y) {
            var _a;
            _a = __read([y.associative_, x.associative_], 2), x.associative_ = _a[0], y.associative_ = _a[1];
        };
        /* ---------------------------------------------------------
            ACCESSORS
        --------------------------------------------------------- */
        SetElementList.prototype.associative = function () {
            return this.associative_;
        };
        return SetElementList;
    }(ListContainer_1.ListContainer));
    exports.SetElementList = SetElementList;
    /**
     *
     */
    (function (SetElementList) {
        /**
         * Iterator of set container storing elements in a list.
         *
         * @template Key Key type
         * @template Unique Whether duplicated key is blocked or not
         * @template Source Source container type
         *
         * @author Jeongho Nam - https://github.com/samchon
         */
        var Iterator = /** @class */ (function (_super) {
            __extends(Iterator, _super);
            /* ---------------------------------------------------------
                CONSTRUCTORS
            --------------------------------------------------------- */
            function Iterator(list, prev, next, val) {
                var _this = _super.call(this, prev, next, val) || this;
                _this.source_ = list;
                return _this;
            }
            /**
             * @internal
             */
            Iterator.create = function (list, prev, next, val) {
                return new Iterator(list, prev, next, val);
            };
            /**
             * @inheritDoc
             */
            Iterator.prototype.reverse = function () {
                return new ReverseIterator(this);
            };
            /* ---------------------------------------------------------
                ACCESSORS
            --------------------------------------------------------- */
            /**
             * @inheritDoc
             */
            Iterator.prototype.source = function () {
                return this.source_.associative();
            };
            return Iterator;
        }(ListIterator_1.ListIterator));
        SetElementList.Iterator = Iterator;
        /**
         * Reverser iterator of set container storing elements in a list.
         *
         * @template Key Key type
         * @template Unique Whether duplicated key is blocked or not
         * @template Source Source container type
         *
         * @author Jeongho Nam - https://github.com/samchon
         */
        var ReverseIterator = /** @class */ (function (_super) {
            __extends(ReverseIterator, _super);
            function ReverseIterator() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            ReverseIterator.prototype._Create_neighbor = function (base) {
                return new ReverseIterator(base);
            };
            return ReverseIterator;
        }(ReverseIterator_1.ReverseIterator));
        SetElementList.ReverseIterator = ReverseIterator;
    })(SetElementList = exports.SetElementList || (exports.SetElementList = {}));
    exports.SetElementList = SetElementList;
    //# sourceMappingURL=SetElementList.js.map
    });

    var HashBuckets_1 = createCommonjsModule(function (module, exports) {
    //================================================================
    /**
     * @packageDocumentation
     * @module std.internal
     */
    //================================================================
    var __values = (commonjsGlobal && commonjsGlobal.__values) || function(o) {
        var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
        if (m) return m.call(o);
        if (o && typeof o.length === "number") return {
            next: function () {
                if (o && i >= o.length) o = void 0;
                return { value: o && o[i++], done: !o };
            }
        };
        throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.HashBuckets = void 0;
    /**
     * Hash buckets
     *
     * @author Jeongho Nam - https://github.com/samchon
     */
    var HashBuckets = /** @class */ (function () {
        /* ---------------------------------------------------------
            CONSTRUCTORS
        --------------------------------------------------------- */
        function HashBuckets(fetcher, hasher) {
            this.fetcher_ = fetcher;
            this.hasher_ = hasher;
            this.max_load_factor_ = DEFAULT_MAX_FACTOR;
            this.data_ = [];
            this.size_ = 0;
            this.initialize();
        }
        HashBuckets.prototype.clear = function () {
            this.data_ = [];
            this.size_ = 0;
            this.initialize();
        };
        HashBuckets.prototype.rehash = function (length) {
            var e_1, _a, e_2, _b;
            length = Math.max(length, MIN_BUCKET_COUNT);
            var data = [];
            for (var i = 0; i < length; ++i)
                data.push([]);
            try {
                for (var _c = __values(this.data_), _d = _c.next(); !_d.done; _d = _c.next()) {
                    var row = _d.value;
                    try {
                        for (var row_1 = (e_2 = void 0, __values(row)), row_1_1 = row_1.next(); !row_1_1.done; row_1_1 = row_1.next()) {
                            var elem = row_1_1.value;
                            var index = this.hasher_(this.fetcher_(elem)) % data.length;
                            data[index].push(elem);
                        }
                    }
                    catch (e_2_1) { e_2 = { error: e_2_1 }; }
                    finally {
                        try {
                            if (row_1_1 && !row_1_1.done && (_b = row_1.return)) _b.call(row_1);
                        }
                        finally { if (e_2) throw e_2.error; }
                    }
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
                }
                finally { if (e_1) throw e_1.error; }
            }
            this.data_ = data;
        };
        HashBuckets.prototype.reserve = function (length) {
            if (length > this.capacity()) {
                length = Math.floor(length / this.max_load_factor_);
                this.rehash(length);
            }
        };
        HashBuckets.prototype.initialize = function () {
            for (var i = 0; i < MIN_BUCKET_COUNT; ++i)
                this.data_.push([]);
        };
        /* ---------------------------------------------------------
            ACCESSORS
        --------------------------------------------------------- */
        HashBuckets.prototype.length = function () {
            return this.data_.length;
        };
        HashBuckets.prototype.capacity = function () {
            return this.data_.length * this.max_load_factor_;
        };
        HashBuckets.prototype.at = function (index) {
            return this.data_[index];
        };
        HashBuckets.prototype.load_factor = function () {
            return this.size_ / this.length();
        };
        HashBuckets.prototype.max_load_factor = function (z) {
            if (z === void 0) { z = null; }
            if (z === null)
                return this.max_load_factor_;
            else
                this.max_load_factor_ = z;
        };
        HashBuckets.prototype.hash_function = function () {
            return this.hasher_;
        };
        /* ---------------------------------------------------------
            ELEMENTS I/O
        --------------------------------------------------------- */
        HashBuckets.prototype.index = function (elem) {
            return this.hasher_(this.fetcher_(elem)) % this.length();
        };
        HashBuckets.prototype.insert = function (val) {
            var capacity = this.capacity();
            if (++this.size_ > capacity)
                this.reserve(capacity * 2);
            var index = this.index(val);
            this.data_[index].push(val);
        };
        HashBuckets.prototype.erase = function (val) {
            var index = this.index(val);
            var bucket = this.data_[index];
            for (var i = 0; i < bucket.length; ++i)
                if (bucket[i] === val) {
                    bucket.splice(i, 1);
                    --this.size_;
                    break;
                }
        };
        return HashBuckets;
    }());
    exports.HashBuckets = HashBuckets;
    var MIN_BUCKET_COUNT = 10;
    var DEFAULT_MAX_FACTOR = 1.0;
    //# sourceMappingURL=HashBuckets.js.map
    });

    var SetHashBuckets_1 = createCommonjsModule(function (module, exports) {
    var __extends = (commonjsGlobal && commonjsGlobal.__extends) || (function () {
        var extendStatics = function (d, b) {
            extendStatics = Object.setPrototypeOf ||
                ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
                function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
            return extendStatics(d, b);
        };
        return function (d, b) {
            if (typeof b !== "function" && b !== null)
                throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
            extendStatics(d, b);
            function __() { this.constructor = d; }
            d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
        };
    })();
    var __read = (commonjsGlobal && commonjsGlobal.__read) || function (o, n) {
        var m = typeof Symbol === "function" && o[Symbol.iterator];
        if (!m) return o;
        var i = m.call(o), r, ar = [], e;
        try {
            while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
        }
        catch (error) { e = { error: error }; }
        finally {
            try {
                if (r && !r.done && (m = i["return"])) m.call(i);
            }
            finally { if (e) throw e.error; }
        }
        return ar;
    };
    var __values = (commonjsGlobal && commonjsGlobal.__values) || function(o) {
        var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
        if (m) return m.call(o);
        if (o && typeof o.length === "number") return {
            next: function () {
                if (o && i >= o.length) o = void 0;
                return { value: o && o[i++], done: !o };
            }
        };
        throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SetHashBuckets = void 0;
    //================================================================
    /**
     * @packageDocumentation
     * @module std.internal
     */
    //================================================================

    /**
     * Hash buckets for set containers
     *
     * @author Jeongho Nam - https://github.com/samchon
     */
    var SetHashBuckets = /** @class */ (function (_super) {
        __extends(SetHashBuckets, _super);
        /* ---------------------------------------------------------
            CONSTRUCTORS
        --------------------------------------------------------- */
        /**
         * Initializer Constructor
         *
         * @param source Source set container
         * @param hasher Hash function
         * @param pred Equality function
         */
        function SetHashBuckets(source, hasher, pred) {
            var _this = _super.call(this, fetcher, hasher) || this;
            _this.source_ = source;
            _this.key_eq_ = pred;
            return _this;
        }
        /**
         * @internal
         */
        SetHashBuckets._Swap_source = function (x, y) {
            var _a;
            _a = __read([y.source_, x.source_], 2), x.source_ = _a[0], y.source_ = _a[1];
        };
        /* ---------------------------------------------------------
            FINDERS
        --------------------------------------------------------- */
        SetHashBuckets.prototype.key_eq = function () {
            return this.key_eq_;
        };
        SetHashBuckets.prototype.find = function (val) {
            var e_1, _a;
            var index = this.hash_function()(val) % this.length();
            var bucket = this.at(index);
            try {
                for (var bucket_1 = __values(bucket), bucket_1_1 = bucket_1.next(); !bucket_1_1.done; bucket_1_1 = bucket_1.next()) {
                    var it = bucket_1_1.value;
                    if (this.key_eq_(it.value, val))
                        return it;
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (bucket_1_1 && !bucket_1_1.done && (_a = bucket_1.return)) _a.call(bucket_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
            return this.source_.end();
        };
        return SetHashBuckets;
    }(HashBuckets_1.HashBuckets));
    exports.SetHashBuckets = SetHashBuckets;
    function fetcher(elem) {
        return elem.value;
    }
    //# sourceMappingURL=SetHashBuckets.js.map
    });

    var Pair_1 = createCommonjsModule(function (module, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.make_pair = exports.Pair = void 0;


    /**
     * Pair of two elements.
     *
     * @author Jeongho Nam - https://github.com/samchon
     */
    var Pair = /** @class */ (function () {
        /* ---------------------------------------------------------
            CONSTRUCTORS
        --------------------------------------------------------- */
        /**
         * Initializer Constructor.
         *
         * @param first The first element.
         * @param second The second element.
         */
        function Pair(first, second) {
            this.first = first;
            this.second = second;
        }
        /* ---------------------------------------------------------
            COMPARISON
        --------------------------------------------------------- */
        /**
         * @inheritDoc
         */
        Pair.prototype.equals = function (pair) {
            return ((0, comparators.equal_to)(this.first, pair.first) &&
                (0, comparators.equal_to)(this.second, pair.second));
        };
        /**
         * @inheritDoc
         */
        Pair.prototype.less = function (pair) {
            if ((0, comparators.equal_to)(this.first, pair.first) === false)
                return (0, comparators.less)(this.first, pair.first);
            else
                return (0, comparators.less)(this.second, pair.second);
        };
        /**
         * @inheritDoc
         */
        Pair.prototype.hashCode = function () {
            return (0, hash_1.hash)(this.first, this.second);
        };
        return Pair;
    }());
    exports.Pair = Pair;
    /**
     * Create a {@link Pair}.
     *
     * @param first The 1st element.
     * @param second The 2nd element.
     *
     * @return A {@link Pair} object.
     */
    function make_pair(first, second) {
        return new Pair(first, second);
    }
    exports.make_pair = make_pair;
    //# sourceMappingURL=Pair.js.map
    });

    var HashSet_1 = createCommonjsModule(function (module, exports) {
    var __extends = (commonjsGlobal && commonjsGlobal.__extends) || (function () {
        var extendStatics = function (d, b) {
            extendStatics = Object.setPrototypeOf ||
                ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
                function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
            return extendStatics(d, b);
        };
        return function (d, b) {
            if (typeof b !== "function" && b !== null)
                throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
            extendStatics(d, b);
            function __() { this.constructor = d; }
            d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
        };
    })();
    var __read = (commonjsGlobal && commonjsGlobal.__read) || function (o, n) {
        var m = typeof Symbol === "function" && o[Symbol.iterator];
        if (!m) return o;
        var i = m.call(o), r, ar = [], e;
        try {
            while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
        }
        catch (error) { e = { error: error }; }
        finally {
            try {
                if (r && !r.done && (m = i["return"])) m.call(i);
            }
            finally { if (e) throw e.error; }
        }
        return ar;
    };
    var __spreadArray = (commonjsGlobal && commonjsGlobal.__spreadArray) || function (to, from, pack) {
        if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
            if (ar || !(i in from)) {
                if (!ar) ar = Array.prototype.slice.call(from, 0, i);
                ar[i] = from[i];
            }
        }
        return to.concat(ar || Array.prototype.slice.call(from));
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.HashSet = void 0;
    //================================================================
    /**
     * @packageDocumentation
     * @module std
     */
    //================================================================





    /**
     * Unique-key Set based on Hash buckets.
     *
     * @author Jeongho Nam - https://github.com/samchon
     */
    var HashSet = /** @class */ (function (_super) {
        __extends(HashSet, _super);
        function HashSet() {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            var _this = _super.call(this, function (thisArg) { return new SetElementList_1.SetElementList(thisArg); }) || this;
            IHashContainer_1.IHashContainer.construct.apply(IHashContainer_1.IHashContainer, __spreadArray([_this,
                HashSet,
                function (hash, pred) {
                    _this.buckets_ = new SetHashBuckets_1.SetHashBuckets(_this, hash, pred);
                }], __read(args), false));
            return _this;
        }
        /* ---------------------------------------------------------
            ASSIGN & CLEAR
        --------------------------------------------------------- */
        /**
         * @inheritDoc
         */
        HashSet.prototype.clear = function () {
            this.buckets_.clear();
            _super.prototype.clear.call(this);
        };
        /**
         * @inheritDoc
         */
        HashSet.prototype.swap = function (obj) {
            var _a, _b;
            // SWAP CONTENTS
            _a = __read([obj.data_, this.data_], 2), this.data_ = _a[0], obj.data_ = _a[1];
            SetElementList_1.SetElementList._Swap_associative(this.data_, obj.data_);
            // SWAP BUCKETS
            SetHashBuckets_1.SetHashBuckets._Swap_source(this.buckets_, obj.buckets_);
            _b = __read([obj.buckets_, this.buckets_], 2), this.buckets_ = _b[0], obj.buckets_ = _b[1];
        };
        /* =========================================================
            ACCESSORS
                - MEMBER
                - HASH
        ============================================================
            MEMBER
        --------------------------------------------------------- */
        /**
         * @inheritDoc
         */
        HashSet.prototype.find = function (key) {
            return this.buckets_.find(key);
        };
        HashSet.prototype.begin = function (index) {
            if (index === void 0) { index = null; }
            if (index === null)
                return _super.prototype.begin.call(this);
            else
                return this.buckets_.at(index)[0];
        };
        HashSet.prototype.end = function (index) {
            if (index === void 0) { index = null; }
            if (index === null)
                return _super.prototype.end.call(this);
            else {
                var bucket = this.buckets_.at(index);
                return bucket[bucket.length - 1].next();
            }
        };
        HashSet.prototype.rbegin = function (index) {
            if (index === void 0) { index = null; }
            return this.end(index).reverse();
        };
        HashSet.prototype.rend = function (index) {
            if (index === void 0) { index = null; }
            return this.begin(index).reverse();
        };
        /* ---------------------------------------------------------
            HASH
        --------------------------------------------------------- */
        /**
         * @inheritDoc
         */
        HashSet.prototype.bucket_count = function () {
            return this.buckets_.length();
        };
        /**
         * @inheritDoc
         */
        HashSet.prototype.bucket_size = function (n) {
            return this.buckets_.at(n).length;
        };
        /**
         * @inheritDoc
         */
        HashSet.prototype.load_factor = function () {
            return this.buckets_.load_factor();
        };
        /**
         * @inheritDoc
         */
        HashSet.prototype.hash_function = function () {
            return this.buckets_.hash_function();
        };
        /**
         * @inheritDoc
         */
        HashSet.prototype.key_eq = function () {
            return this.buckets_.key_eq();
        };
        /**
         * @inheritDoc
         */
        HashSet.prototype.bucket = function (key) {
            return this.hash_function()(key) % this.buckets_.length();
        };
        HashSet.prototype.max_load_factor = function (z) {
            if (z === void 0) { z = null; }
            return this.buckets_.max_load_factor(z);
        };
        /**
         * @inheritDoc
         */
        HashSet.prototype.reserve = function (n) {
            this.buckets_.reserve(n);
        };
        /**
         * @inheritDoc
         */
        HashSet.prototype.rehash = function (n) {
            this.buckets_.rehash(n);
        };
        /* =========================================================
            ELEMENTS I/O
                - INSERT
                - POST-PROCESS
                - SWAP
        ============================================================
            INSERT
        --------------------------------------------------------- */
        HashSet.prototype._Insert_by_key = function (key) {
            // TEST WHETHER EXIST
            var it = this.find(key);
            if (it.equals(this.end()) === false)
                return new Pair_1.Pair(it, false);
            // INSERT
            this.data_.push(key);
            it = it.prev();
            // POST-PROCESS
            this._Handle_insert(it, it.next());
            return new Pair_1.Pair(it, true);
        };
        HashSet.prototype._Insert_by_hint = function (hint, key) {
            // FIND DUPLICATED KEY
            var it = this.find(key);
            if (it.equals(this.end()) === true) {
                // INSERT
                it = this.data_.insert(hint, key);
                // POST-PROCESS
                this._Handle_insert(it, it.next());
            }
            return it;
        };
        /* ---------------------------------------------------------
            POST-PROCESS
        --------------------------------------------------------- */
        HashSet.prototype._Handle_insert = function (first, last) {
            for (; !first.equals(last); first = first.next())
                this.buckets_.insert(first);
        };
        HashSet.prototype._Handle_erase = function (first, last) {
            for (; !first.equals(last); first = first.next())
                this.buckets_.erase(first);
        };
        return HashSet;
    }(UniqueSet_1.UniqueSet));
    exports.HashSet = HashSet;
    /**
     *
     */
    (function (HashSet) {
        // BODY
        HashSet.Iterator = SetElementList_1.SetElementList.Iterator;
        HashSet.ReverseIterator = SetElementList_1.SetElementList.ReverseIterator;
    })(HashSet = exports.HashSet || (exports.HashSet = {}));
    exports.HashSet = HashSet;
    //# sourceMappingURL=HashSet.js.map
    });

    var MapContainer_1 = createCommonjsModule(function (module, exports) {
    var __extends = (commonjsGlobal && commonjsGlobal.__extends) || (function () {
        var extendStatics = function (d, b) {
            extendStatics = Object.setPrototypeOf ||
                ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
                function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
            return extendStatics(d, b);
        };
        return function (d, b) {
            if (typeof b !== "function" && b !== null)
                throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
            extendStatics(d, b);
            function __() { this.constructor = d; }
            d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
        };
    })();
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MapContainer = void 0;


    /**
     * Basic map container.
     *
     * @template Key Key type
     * @template T Mapped type
     * @template Unique Whether duplicated key is blocked or not
     * @template Source Derived type extending this {@link MapContainer}
     * @template IteratorT Iterator type
     * @template ReverseT Reverse iterator type
     *
     * @author Jeongho Nam - https://github.com/samchon
     */
    var MapContainer = /** @class */ (function (_super) {
        __extends(MapContainer, _super);
        /* ---------------------------------------------------------
            CONSTURCTORS
        --------------------------------------------------------- */
        /**
         * Default Constructor.
         */
        function MapContainer(factory) {
            var _this = _super.call(this) || this;
            _this.data_ = factory(_this);
            return _this;
        }
        /**
         * @inheritDoc
         */
        MapContainer.prototype.assign = function (first, last) {
            // INSERT
            this.clear();
            this.insert(first, last);
        };
        /**
         * @inheritDoc
         */
        MapContainer.prototype.clear = function () {
            // TO BE ABSTRACT
            this.data_.clear();
        };
        /**
         * @inheritDoc
         */
        MapContainer.prototype.begin = function () {
            return this.data_.begin();
        };
        /**
         * @inheritDoc
         */
        MapContainer.prototype.end = function () {
            return this.data_.end();
        };
        /* ---------------------------------------------------------
            ELEMENTS
        --------------------------------------------------------- */
        /**
         * @inheritDoc
         */
        MapContainer.prototype.has = function (key) {
            return !this.find(key).equals(this.end());
        };
        /**
         * @inheritDoc
         */
        MapContainer.prototype.size = function () {
            return this.data_.size();
        };
        /* =========================================================
            ELEMENTS I/O
                - INSERT
                - ERASE
                - UTILITY
                - POST-PROCESS
        ============================================================
            INSERT
        --------------------------------------------------------- */
        /**
         * @inheritDoc
         */
        MapContainer.prototype.push = function () {
            var items = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                items[_i] = arguments[_i];
            }
            // INSERT BY RANGE
            var first = new NativeArrayIterator_1.NativeArrayIterator(items, 0);
            var last = new NativeArrayIterator_1.NativeArrayIterator(items, items.length);
            this.insert(first, last);
            // RETURN SIZE
            return this.size();
        };
        MapContainer.prototype.insert = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            if (args.length === 1)
                return this.emplace(args[0].first, args[0].second);
            else if (args[0].next instanceof Function &&
                args[1].next instanceof Function)
                return this._Insert_by_range(args[0], args[1]);
            else
                return this.emplace_hint(args[0], args[1].first, args[1].second);
        };
        MapContainer.prototype.erase = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            if (args.length === 1 &&
                (args[0] instanceof this.end().constructor === false ||
                    args[0].source() !== this))
                return this._Erase_by_key(args[0]);
            else if (args.length === 1)
                return this._Erase_by_range(args[0]);
            else
                return this._Erase_by_range(args[0], args[1]);
        };
        MapContainer.prototype._Erase_by_range = function (first, last) {
            if (last === void 0) { last = first.next(); }
            // ERASE
            var it = this.data_.erase(first, last);
            // POST-PROCESS
            this._Handle_erase(first, last);
            return it;
        };
        return MapContainer;
    }(Container_1.Container));
    exports.MapContainer = MapContainer;
    //# sourceMappingURL=MapContainer.js.map
    });

    var UniqueMap_1 = createCommonjsModule(function (module, exports) {
    var __extends = (commonjsGlobal && commonjsGlobal.__extends) || (function () {
        var extendStatics = function (d, b) {
            extendStatics = Object.setPrototypeOf ||
                ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
                function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
            return extendStatics(d, b);
        };
        return function (d, b) {
            if (typeof b !== "function" && b !== null)
                throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
            extendStatics(d, b);
            function __() { this.constructor = d; }
            d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
        };
    })();
    var __read = (commonjsGlobal && commonjsGlobal.__read) || function (o, n) {
        var m = typeof Symbol === "function" && o[Symbol.iterator];
        if (!m) return o;
        var i = m.call(o), r, ar = [], e;
        try {
            while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
        }
        catch (error) { e = { error: error }; }
        finally {
            try {
                if (r && !r.done && (m = i["return"])) m.call(i);
            }
            finally { if (e) throw e.error; }
        }
        return ar;
    };
    var __spreadArray = (commonjsGlobal && commonjsGlobal.__spreadArray) || function (to, from, pack) {
        if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
            if (ar || !(i in from)) {
                if (!ar) ar = Array.prototype.slice.call(from, 0, i);
                ar[i] = from[i];
            }
        }
        return to.concat(ar || Array.prototype.slice.call(from));
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.UniqueMap = void 0;
    //================================================================
    /**
     * @packageDocumentation
     * @module std.base
     */
    //================================================================


    /**
     * Basic map container blocking duplicated key.
     *
     * @template Key Key type
     * @template T Mapped type
     * @template Source Derived type extending this {@link UniqueMap}
     * @template IteratorT Iterator type
     * @template ReverseT Reverse iterator type
     *
     * @author Jeongho Nam - https://github.com/samchon
     */
    var UniqueMap = /** @class */ (function (_super) {
        __extends(UniqueMap, _super);
        function UniqueMap() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        /* ---------------------------------------------------------
            ACCESSORS
        --------------------------------------------------------- */
        /**
         * @inheritDoc
         */
        UniqueMap.prototype.count = function (key) {
            return this.find(key).equals(this.end()) ? 0 : 1;
        };
        /**
         * Get a value.
         *
         * @param key Key to search for.
         * @return The value mapped by the key.
         */
        UniqueMap.prototype.get = function (key) {
            var it = this.find(key);
            if (it.equals(this.end()) === true)
                throw ErrorGenerator_1.ErrorGenerator.key_nout_found(this, "get", key);
            return it.second;
        };
        /**
         * Take a value.
         *
         * Get a value, or set the value and returns it.
         *
         * @param key Key to search for.
         * @param generator Value generator when the matched key not found
         * @returns Value, anyway
         */
        UniqueMap.prototype.take = function (key, generator) {
            var it = this.find(key);
            return it.equals(this.end())
                ? this.emplace(key, generator()).first.second
                : it.second;
        };
        /**
         * Set a value with key.
         *
         * @param key Key to be mapped or search for.
         * @param val Value to insert or assign.
         */
        UniqueMap.prototype.set = function (key, val) {
            this.insert_or_assign(key, val);
        };
        UniqueMap.prototype.insert = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            return _super.prototype.insert.apply(this, __spreadArray([], __read(args), false));
        };
        UniqueMap.prototype._Insert_by_range = function (first, last) {
            for (var it = first; !it.equals(last); it = it.next())
                this.emplace(it.value.first, it.value.second);
        };
        UniqueMap.prototype.insert_or_assign = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            if (args.length === 2) {
                return this._Insert_or_assign_with_key_value(args[0], args[1]);
            }
            else if (args.length === 3) {
                // INSERT OR ASSIGN AN ELEMENT
                return this._Insert_or_assign_with_hint(args[0], args[1], args[2]);
            }
        };
        UniqueMap.prototype._Insert_or_assign_with_key_value = function (key, value) {
            var ret = this.emplace(key, value);
            if (ret.second === false)
                ret.first.second = value;
            return ret;
        };
        UniqueMap.prototype._Insert_or_assign_with_hint = function (hint, key, value) {
            var ret = this.emplace_hint(hint, key, value);
            if (ret.second !== value)
                ret.second = value;
            return ret;
        };
        UniqueMap.prototype.extract = function (param) {
            if (param instanceof this.end().constructor)
                return this._Extract_by_iterator(param);
            else
                return this._Extract_by_key(param);
        };
        UniqueMap.prototype._Extract_by_key = function (key) {
            var it = this.find(key);
            if (it.equals(this.end()) === true)
                throw ErrorGenerator_1.ErrorGenerator.key_nout_found(this, "extract", key);
            var ret = it.value;
            this._Erase_by_range(it);
            return ret;
        };
        UniqueMap.prototype._Extract_by_iterator = function (it) {
            if (it.equals(this.end()) === true)
                return this.end();
            this._Erase_by_range(it);
            return it;
        };
        UniqueMap.prototype._Erase_by_key = function (key) {
            var it = this.find(key);
            if (it.equals(this.end()) === true)
                return 0;
            this._Erase_by_range(it);
            return 1;
        };
        /* ---------------------------------------------------------
            UTILITY
        --------------------------------------------------------- */
        /**
         * @inheritDoc
         */
        UniqueMap.prototype.merge = function (source) {
            for (var it = source.begin(); !it.equals(source.end());)
                if (this.has(it.first) === false) {
                    this.insert(it.value);
                    it = source.erase(it);
                }
                else
                    it = it.next();
        };
        return UniqueMap;
    }(MapContainer_1.MapContainer));
    exports.UniqueMap = UniqueMap;
    //# sourceMappingURL=UniqueMap.js.map
    });

    var MapElementList_1 = createCommonjsModule(function (module, exports) {
    var __extends = (commonjsGlobal && commonjsGlobal.__extends) || (function () {
        var extendStatics = function (d, b) {
            extendStatics = Object.setPrototypeOf ||
                ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
                function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
            return extendStatics(d, b);
        };
        return function (d, b) {
            if (typeof b !== "function" && b !== null)
                throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
            extendStatics(d, b);
            function __() { this.constructor = d; }
            d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
        };
    })();
    var __read = (commonjsGlobal && commonjsGlobal.__read) || function (o, n) {
        var m = typeof Symbol === "function" && o[Symbol.iterator];
        if (!m) return o;
        var i = m.call(o), r, ar = [], e;
        try {
            while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
        }
        catch (error) { e = { error: error }; }
        finally {
            try {
                if (r && !r.done && (m = i["return"])) m.call(i);
            }
            finally { if (e) throw e.error; }
        }
        return ar;
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MapElementList = void 0;
    //================================================================
    /**
     * @packageDocumentation
     * @module std.internal
     */
    //================================================================



    /**
     * Doubly Linked List storing map elements.
     *
     * @template Key Key type
     * @template T Mapped type
     * @template Unique Whether duplicated key is blocked or not
     * @template Source Source type
     *
     * @author Jeongho Nam - https://github.com/samchon
     */
    var MapElementList = /** @class */ (function (_super) {
        __extends(MapElementList, _super);
        /* ---------------------------------------------------------
            CONSTRUCTORS
        --------------------------------------------------------- */
        function MapElementList(associative) {
            var _this = _super.call(this) || this;
            _this.associative_ = associative;
            return _this;
        }
        MapElementList.prototype._Create_iterator = function (prev, next, val) {
            return MapElementList.Iterator.create(this, prev, next, val);
        };
        /**
         * @internal
         */
        MapElementList._Swap_associative = function (x, y) {
            var _a;
            _a = __read([y.associative_, x.associative_], 2), x.associative_ = _a[0], y.associative_ = _a[1];
        };
        /* ---------------------------------------------------------
            ACCESSORS
        --------------------------------------------------------- */
        MapElementList.prototype.associative = function () {
            return this.associative_;
        };
        return MapElementList;
    }(ListContainer_1.ListContainer));
    exports.MapElementList = MapElementList;
    /**
     *
     */
    (function (MapElementList) {
        /**
         * Iterator of map container storing elements in a list.
         *
         * @template Key Key type
         * @template T Mapped type
         * @template Unique Whether duplicated key is blocked or not
         * @template Source Source container type
         *
         * @author Jeongho Nam - https://github.com/samchon
         */
        var Iterator = /** @class */ (function (_super) {
            __extends(Iterator, _super);
            /* ---------------------------------------------------------
                CONSTRUCTORS
            --------------------------------------------------------- */
            function Iterator(list, prev, next, val) {
                var _this = _super.call(this, prev, next, val) || this;
                _this.list_ = list;
                return _this;
            }
            /**
             * @internal
             */
            Iterator.create = function (list, prev, next, val) {
                return new Iterator(list, prev, next, val);
            };
            /**
             * @inheritDoc
             */
            Iterator.prototype.reverse = function () {
                return new ReverseIterator(this);
            };
            /* ---------------------------------------------------------
                ACCESSORS
            --------------------------------------------------------- */
            /**
             * @inheritDoc
             */
            Iterator.prototype.source = function () {
                return this.list_.associative();
            };
            Object.defineProperty(Iterator.prototype, "first", {
                /**
                 * @inheritDoc
                 */
                get: function () {
                    return this.value.first;
                },
                enumerable: false,
                configurable: true
            });
            Object.defineProperty(Iterator.prototype, "second", {
                /**
                 * @inheritDoc
                 */
                get: function () {
                    return this.value.second;
                },
                /**
                 * @inheritDoc
                 */
                set: function (val) {
                    this.value.second = val;
                },
                enumerable: false,
                configurable: true
            });
            return Iterator;
        }(ListIterator_1.ListIterator));
        MapElementList.Iterator = Iterator;
        /**
         * Reverse iterator of map container storing elements a list.
         *
         * @template Key Key type
         * @template T Mapped type
         * @template Unique Whether duplicated key is blocked or not
         * @template Source Source container type
         *
         * @author Jeongho Nam - https://github.com/samchon
         */
        var ReverseIterator = /** @class */ (function (_super) {
            __extends(ReverseIterator, _super);
            function ReverseIterator() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            /* ---------------------------------------------------------
                CONSTRUCTORS
            --------------------------------------------------------- */
            ReverseIterator.prototype._Create_neighbor = function (base) {
                return new ReverseIterator(base);
            };
            Object.defineProperty(ReverseIterator.prototype, "first", {
                /* ---------------------------------------------------------
                    ACCESSORS
                --------------------------------------------------------- */
                /**
                 * Get the first, key element.
                 *
                 * @return The first element.
                 */
                get: function () {
                    return this.base_.first;
                },
                enumerable: false,
                configurable: true
            });
            Object.defineProperty(ReverseIterator.prototype, "second", {
                /**
                 * Get the second, stored element.
                 *
                 * @return The second element.
                 */
                get: function () {
                    return this.base_.second;
                },
                /**
                 * Set the second, stored element.
                 *
                 * @param val The value to set.
                 */
                set: function (val) {
                    this.base_.second = val;
                },
                enumerable: false,
                configurable: true
            });
            return ReverseIterator;
        }(ReverseIterator_1.ReverseIterator));
        MapElementList.ReverseIterator = ReverseIterator;
    })(MapElementList = exports.MapElementList || (exports.MapElementList = {}));
    exports.MapElementList = MapElementList;
    //# sourceMappingURL=MapElementList.js.map
    });

    var MapHashBuckets_1 = createCommonjsModule(function (module, exports) {
    var __extends = (commonjsGlobal && commonjsGlobal.__extends) || (function () {
        var extendStatics = function (d, b) {
            extendStatics = Object.setPrototypeOf ||
                ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
                function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
            return extendStatics(d, b);
        };
        return function (d, b) {
            if (typeof b !== "function" && b !== null)
                throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
            extendStatics(d, b);
            function __() { this.constructor = d; }
            d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
        };
    })();
    var __read = (commonjsGlobal && commonjsGlobal.__read) || function (o, n) {
        var m = typeof Symbol === "function" && o[Symbol.iterator];
        if (!m) return o;
        var i = m.call(o), r, ar = [], e;
        try {
            while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
        }
        catch (error) { e = { error: error }; }
        finally {
            try {
                if (r && !r.done && (m = i["return"])) m.call(i);
            }
            finally { if (e) throw e.error; }
        }
        return ar;
    };
    var __values = (commonjsGlobal && commonjsGlobal.__values) || function(o) {
        var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
        if (m) return m.call(o);
        if (o && typeof o.length === "number") return {
            next: function () {
                if (o && i >= o.length) o = void 0;
                return { value: o && o[i++], done: !o };
            }
        };
        throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MapHashBuckets = void 0;
    //================================================================
    /**
     * @packageDocumentation
     * @module std.internal
     */
    //================================================================

    /**
     * Hash buckets for map containers.
     *
     * @author Jeongho Nam - https://github.com/samchon
     */
    var MapHashBuckets = /** @class */ (function (_super) {
        __extends(MapHashBuckets, _super);
        /* ---------------------------------------------------------
            CONSTRUCTORS
        --------------------------------------------------------- */
        /**
         * Initializer Constructor
         *
         * @param source Source map container
         * @param hasher Hash function
         * @param pred Equality function
         */
        function MapHashBuckets(source, hasher, pred) {
            var _this = _super.call(this, fetcher, hasher) || this;
            _this.source_ = source;
            _this.key_eq_ = pred;
            return _this;
        }
        /**
         * @internal
         */
        MapHashBuckets._Swap_source = function (x, y) {
            var _a;
            _a = __read([y.source_, x.source_], 2), x.source_ = _a[0], y.source_ = _a[1];
        };
        /* ---------------------------------------------------------
            FINDERS
        --------------------------------------------------------- */
        MapHashBuckets.prototype.key_eq = function () {
            return this.key_eq_;
        };
        MapHashBuckets.prototype.find = function (key) {
            var e_1, _a;
            var index = this.hash_function()(key) % this.length();
            var bucket = this.at(index);
            try {
                for (var bucket_1 = __values(bucket), bucket_1_1 = bucket_1.next(); !bucket_1_1.done; bucket_1_1 = bucket_1.next()) {
                    var it = bucket_1_1.value;
                    if (this.key_eq_(it.first, key))
                        return it;
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (bucket_1_1 && !bucket_1_1.done && (_a = bucket_1.return)) _a.call(bucket_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
            return this.source_.end();
        };
        return MapHashBuckets;
    }(HashBuckets_1.HashBuckets));
    exports.MapHashBuckets = MapHashBuckets;
    function fetcher(elem) {
        return elem.first;
    }
    //# sourceMappingURL=MapHashBuckets.js.map
    });

    var Entry_1 = createCommonjsModule(function (module, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Entry = void 0;


    /**
     * Entry for mapping.
     *
     * @author Jeongho Nam - https://github.com/samchon
     */
    var Entry = /** @class */ (function () {
        /**
         * Intializer Constructor.
         *
         * @param first The first, key element.
         * @param second The second, mapped element.
         */
        function Entry(first, second) {
            this.first = first;
            this.second = second;
        }
        /**
         * @inheritDoc
         */
        Entry.prototype.equals = function (obj) {
            return (0, comparators.equal_to)(this.first, obj.first);
        };
        /**
         * @inheritDoc
         */
        Entry.prototype.less = function (obj) {
            return (0, comparators.less)(this.first, obj.first);
        };
        /**
         * @inheritDoc
         */
        Entry.prototype.hashCode = function () {
            return (0, hash_1.hash)(this.first);
        };
        return Entry;
    }());
    exports.Entry = Entry;
    //# sourceMappingURL=Entry.js.map
    });

    var HashMap_1 = createCommonjsModule(function (module, exports) {
    var __extends = (commonjsGlobal && commonjsGlobal.__extends) || (function () {
        var extendStatics = function (d, b) {
            extendStatics = Object.setPrototypeOf ||
                ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
                function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
            return extendStatics(d, b);
        };
        return function (d, b) {
            if (typeof b !== "function" && b !== null)
                throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
            extendStatics(d, b);
            function __() { this.constructor = d; }
            d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
        };
    })();
    var __read = (commonjsGlobal && commonjsGlobal.__read) || function (o, n) {
        var m = typeof Symbol === "function" && o[Symbol.iterator];
        if (!m) return o;
        var i = m.call(o), r, ar = [], e;
        try {
            while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
        }
        catch (error) { e = { error: error }; }
        finally {
            try {
                if (r && !r.done && (m = i["return"])) m.call(i);
            }
            finally { if (e) throw e.error; }
        }
        return ar;
    };
    var __spreadArray = (commonjsGlobal && commonjsGlobal.__spreadArray) || function (to, from, pack) {
        if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
            if (ar || !(i in from)) {
                if (!ar) ar = Array.prototype.slice.call(from, 0, i);
                ar[i] = from[i];
            }
        }
        return to.concat(ar || Array.prototype.slice.call(from));
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.HashMap = void 0;
    //================================================================
    /**
     * @packageDocumentation
     * @module std
     */
    //================================================================






    /**
     * Unique-key Map based on Hash buckets.
     *
     * @author Jeongho Nam - https://github.com/samchon
     */
    var HashMap = /** @class */ (function (_super) {
        __extends(HashMap, _super);
        function HashMap() {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            var _this = _super.call(this, function (thisArg) { return new MapElementList_1.MapElementList(thisArg); }) || this;
            IHashContainer_1.IHashContainer.construct.apply(IHashContainer_1.IHashContainer, __spreadArray([_this,
                HashMap,
                function (hash, pred) {
                    _this.buckets_ = new MapHashBuckets_1.MapHashBuckets(_this, hash, pred);
                }], __read(args), false));
            return _this;
        }
        /* ---------------------------------------------------------
            ASSIGN & CLEAR
        --------------------------------------------------------- */
        /**
         * @inheritDoc
         */
        HashMap.prototype.clear = function () {
            this.buckets_.clear();
            _super.prototype.clear.call(this);
        };
        /**
         * @inheritDoc
         */
        HashMap.prototype.swap = function (obj) {
            var _a, _b;
            // SWAP CONTENTS
            _a = __read([obj.data_, this.data_], 2), this.data_ = _a[0], obj.data_ = _a[1];
            MapElementList_1.MapElementList._Swap_associative(this.data_, obj.data_);
            // SWAP BUCKETS
            MapHashBuckets_1.MapHashBuckets._Swap_source(this.buckets_, obj.buckets_);
            _b = __read([obj.buckets_, this.buckets_], 2), this.buckets_ = _b[0], obj.buckets_ = _b[1];
        };
        /* =========================================================
            ACCESSORS
                - MEMBER
                - HASH
        ============================================================
            MEMBER
        --------------------------------------------------------- */
        /**
         * @inheritDoc
         */
        HashMap.prototype.find = function (key) {
            return this.buckets_.find(key);
        };
        HashMap.prototype.begin = function (index) {
            if (index === void 0) { index = null; }
            if (index === null)
                return _super.prototype.begin.call(this);
            else
                return this.buckets_.at(index)[0];
        };
        HashMap.prototype.end = function (index) {
            if (index === void 0) { index = null; }
            if (index === null)
                return _super.prototype.end.call(this);
            else {
                var bucket = this.buckets_.at(index);
                return bucket[bucket.length - 1].next();
            }
        };
        HashMap.prototype.rbegin = function (index) {
            if (index === void 0) { index = null; }
            return this.end(index).reverse();
        };
        HashMap.prototype.rend = function (index) {
            if (index === void 0) { index = null; }
            return this.begin(index).reverse();
        };
        /* ---------------------------------------------------------
            HASH
        --------------------------------------------------------- */
        /**
         * @inheritDoc
         */
        HashMap.prototype.bucket_count = function () {
            return this.buckets_.length();
        };
        /**
         * @inheritDoc
         */
        HashMap.prototype.bucket_size = function (index) {
            return this.buckets_.at(index).length;
        };
        /**
         * @inheritDoc
         */
        HashMap.prototype.load_factor = function () {
            return this.buckets_.load_factor();
        };
        /**
         * @inheritDoc
         */
        HashMap.prototype.hash_function = function () {
            return this.buckets_.hash_function();
        };
        /**
         * @inheritDoc
         */
        HashMap.prototype.key_eq = function () {
            return this.buckets_.key_eq();
        };
        /**
         * @inheritDoc
         */
        HashMap.prototype.bucket = function (key) {
            return this.hash_function()(key) % this.buckets_.length();
        };
        HashMap.prototype.max_load_factor = function (z) {
            if (z === void 0) { z = null; }
            return this.buckets_.max_load_factor(z);
        };
        /**
         * @inheritDoc
         */
        HashMap.prototype.reserve = function (n) {
            this.buckets_.reserve(n);
        };
        /**
         * @inheritDoc
         */
        HashMap.prototype.rehash = function (n) {
            this.buckets_.rehash(n);
        };
        /* =========================================================
            ELEMENTS I/O
                - INSERT
                - POST-PROCESS
        ============================================================
            INSERT
        --------------------------------------------------------- */
        /**
         * @inheritDoc
         */
        HashMap.prototype.emplace = function (key, val) {
            // TEST WHETHER EXIST
            var it = this.find(key);
            if (it.equals(this.end()) === false)
                return new Pair_1.Pair(it, false);
            // INSERT
            this.data_.push(new Entry_1.Entry(key, val));
            it = it.prev();
            // POST-PROCESS
            this._Handle_insert(it, it.next());
            return new Pair_1.Pair(it, true);
        };
        /**
         * @inheritDoc
         */
        HashMap.prototype.emplace_hint = function (hint, key, val) {
            // FIND DUPLICATED KEY
            var it = this.find(key);
            if (it.equals(this.end()) === true) {
                // INSERT
                it = this.data_.insert(hint, new Entry_1.Entry(key, val));
                // POST-PROCESS
                this._Handle_insert(it, it.next());
            }
            return it;
        };
        /* ---------------------------------------------------------
            POST-PROCESS
        --------------------------------------------------------- */
        HashMap.prototype._Handle_insert = function (first, last) {
            for (; !first.equals(last); first = first.next())
                this.buckets_.insert(first);
        };
        HashMap.prototype._Handle_erase = function (first, last) {
            for (; !first.equals(last); first = first.next())
                this.buckets_.erase(first);
        };
        return HashMap;
    }(UniqueMap_1.UniqueMap));
    exports.HashMap = HashMap;
    /**
     *
     */
    (function (HashMap) {
        // BODY
        HashMap.Iterator = MapElementList_1.MapElementList.Iterator;
        HashMap.ReverseIterator = MapElementList_1.MapElementList.ReverseIterator;
    })(HashMap = exports.HashMap || (exports.HashMap = {}));
    exports.HashMap = HashMap;
    //# sourceMappingURL=HashMap.js.map
    });

    var __values = (commonjsGlobal && commonjsGlobal.__values) || function (o) {
        var m = typeof Symbol === "function" && o[Symbol.iterator], i = 0;
        if (m) return m.call(o);
        return {
            next: function () {
                if (o && i >= o.length) o = void 0;
                return { value: o && o[i++], done: !o };
            }
        };
    };



    var EventTarget = /** @class */ (function () {
        function EventTarget() {
            this.listeners_ = new HashMap_1.HashMap();
            this.created_at_ = new Date();
        }
        EventTarget.prototype.dispatchEvent = function (event) {
            var e_1, _a;
            // FIND LISTENERS
            var it = this.listeners_.find(event.type);
            if (it.equals(this.listeners_.end()))
                return;
            // SET DEFAULT ARGUMENTS
            event.target = this;
            event.timeStamp = new Date().getTime() - this.created_at_.getTime();
            try {
                // CALL THE LISTENERS
                for (var _b = __values(it.second), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var listener = _c.value;
                    listener(event);
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_1) throw e_1.error; }
            }
        };
        EventTarget.prototype.addEventListener = function (type, listener) {
            var it = this.listeners_.find(type);
            if (it.equals(this.listeners_.end()))
                it = this.listeners_.emplace(type, new HashSet_1.HashSet()).first;
            it.second.insert(listener);
        };
        EventTarget.prototype.removeEventListener = function (type, listener) {
            var it = this.listeners_.find(type);
            if (it.equals(this.listeners_.end()))
                return;
            it.second.erase(listener);
            if (it.second.empty())
                this.listeners_.erase(it);
        };
        return EventTarget;
    }());
    var EventTarget_2 = EventTarget;


    var EventTarget_1 = /*#__PURE__*/Object.defineProperty({
    	EventTarget: EventTarget_2
    }, '__esModule', {value: true});

    var Event = /** @class */ (function () {
        function Event(type, init) {
            this.type = type;
            if (init)
                Object.assign(this, init);
        }
        return Event;
    }());
    var Event_2 = Event;


    var Event_1 = /*#__PURE__*/Object.defineProperty({
    	Event: Event_2
    }, '__esModule', {value: true});

    var __extends$2 = (commonjsGlobal && commonjsGlobal.__extends) || (function () {
        var extendStatics = function (d, b) {
            extendStatics = Object.setPrototypeOf ||
                ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
                function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
            return extendStatics(d, b);
        };
        return function (d, b) {
            extendStatics(d, b);
            function __() { this.constructor = d; }
            d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
        };
    })();


    var CloseEvent = /** @class */ (function (_super) {
        __extends$2(CloseEvent, _super);
        function CloseEvent(type, init) {
            return _super.call(this, type, init) || this;
        }
        return CloseEvent;
    }(Event_1.Event));
    var CloseEvent_2 = CloseEvent;


    var CloseEvent_1 = /*#__PURE__*/Object.defineProperty({
    	CloseEvent: CloseEvent_2
    }, '__esModule', {value: true});

    var __extends$1 = (commonjsGlobal && commonjsGlobal.__extends) || (function () {
        var extendStatics = function (d, b) {
            extendStatics = Object.setPrototypeOf ||
                ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
                function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
            return extendStatics(d, b);
        };
        return function (d, b) {
            extendStatics(d, b);
            function __() { this.constructor = d; }
            d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
        };
    })();


    var MessageEvent = /** @class */ (function (_super) {
        __extends$1(MessageEvent, _super);
        function MessageEvent(type, init) {
            return _super.call(this, type, init) || this;
        }
        return MessageEvent;
    }(Event_1.Event));
    var MessageEvent_2 = MessageEvent;


    var MessageEvent_1 = /*#__PURE__*/Object.defineProperty({
    	MessageEvent: MessageEvent_2
    }, '__esModule', {value: true});

    var __extends = (commonjsGlobal && commonjsGlobal.__extends) || (function () {
        var extendStatics = function (d, b) {
            extendStatics = Object.setPrototypeOf ||
                ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
                function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
            return extendStatics(d, b);
        };
        return function (d, b) {
            extendStatics(d, b);
            function __() { this.constructor = d; }
            d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
        };
    })();


    var ErrorEvent = /** @class */ (function (_super) {
        __extends(ErrorEvent, _super);
        function ErrorEvent(type, init) {
            return _super.call(this, type, init) || this;
        }
        return ErrorEvent;
    }(Event_1.Event));
    var ErrorEvent_2 = ErrorEvent;


    var ErrorEvent_1 = /*#__PURE__*/Object.defineProperty({
    	ErrorEvent: ErrorEvent_2
    }, '__esModule', {value: true});

    var WebSocket_1 = createCommonjsModule(function (module, exports) {
    var __extends = (commonjsGlobal && commonjsGlobal.__extends) || (function () {
        var extendStatics = function (d, b) {
            extendStatics = Object.setPrototypeOf ||
                ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
                function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
            return extendStatics(d, b);
        };
        return function (d, b) {
            extendStatics(d, b);
            function __() { this.constructor = d; }
            d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
        };
    })();
    var __assign = (commonjsGlobal && commonjsGlobal.__assign) || function () {
        __assign = Object.assign || function(t) {
            for (var s, i = 1, n = arguments.length; i < n; i++) {
                s = arguments[i];
                for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                    t[p] = s[p];
            }
            return t;
        };
        return __assign.apply(this, arguments);
    };
    Object.defineProperty(exports, "__esModule", { value: true });






    var WebSocket = /** @class */ (function (_super) {
        __extends(WebSocket, _super);
        /* ----------------------------------------------------------------
            CONSTRUCTORS
        ---------------------------------------------------------------- */
        function WebSocket(url, protocols) {
            var _this = _super.call(this) || this;
            _this.on_ = {};
            _this.state_ = WebSocket.CONNECTING;
            //----
            // CLIENT
            //----
            // PREPARE SOCKET
            _this.client_ = new browser.client();
            _this.client_.on("connect", _this._Handle_connect.bind(_this));
            _this.client_.on("connectFailed", _this._Handle_error.bind(_this));
            if (typeof protocols === "string")
                protocols = [protocols];
            // DO CONNECT
            _this.client_.connect(url, protocols);
            return _this;
        }
        WebSocket.prototype.close = function (code, reason) {
            this.state_ = WebSocket.CLOSING;
            if (code === undefined)
                this.connection_.sendCloseFrame();
            else
                this.connection_.sendCloseFrame(code, reason, true);
        };
        /* ================================================================
            ACCESSORS
                - SENDER
                - PROPERTIES
                - LISTENERS
        ===================================================================
            SENDER
        ---------------------------------------------------------------- */
        WebSocket.prototype.send = function (data) {
            if (typeof data.valueOf() === "string")
                this.connection_.sendUTF(data);
            else {
                var buffer = void 0;
                if (data instanceof Buffer)
                    buffer = data;
                else if (data instanceof Blob)
                    buffer = new Buffer(data, "blob");
                else if (data.buffer)
                    buffer = new Buffer(data.buffer);
                else
                    buffer = new Buffer(data);
                this.connection_.sendBytes(buffer);
            }
        };
        Object.defineProperty(WebSocket.prototype, "url", {
            /* ----------------------------------------------------------------
                PROPERTIES
            ---------------------------------------------------------------- */
            get: function () {
                return this.client_.url.href;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(WebSocket.prototype, "protocol", {
            get: function () {
                return this.client_.protocols
                    ? this.client_.protocols[0]
                    : "";
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(WebSocket.prototype, "extensions", {
            get: function () {
                return this.connection_ && this.connection_.extensions
                    ? this.connection_.extensions[0].name
                    : "";
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(WebSocket.prototype, "readyState", {
            get: function () {
                return this.state_;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(WebSocket.prototype, "bufferedAmount", {
            get: function () {
                return this.connection_.bytesWaitingToFlush;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(WebSocket.prototype, "binaryType", {
            get: function () {
                return "arraybuffer";
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(WebSocket.prototype, "onopen", {
            /* ----------------------------------------------------------------
                LISTENERS
            ---------------------------------------------------------------- */
            get: function () {
                return this.on_.open;
            },
            set: function (listener) {
                this._Set_on("open", listener);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(WebSocket.prototype, "onclose", {
            get: function () {
                return this.on_.close;
            },
            set: function (listener) {
                this._Set_on("close", listener);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(WebSocket.prototype, "onmessage", {
            get: function () {
                return this.on_.message;
            },
            set: function (listener) {
                this._Set_on("message", listener);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(WebSocket.prototype, "onerror", {
            get: function () {
                return this.on_.error;
            },
            set: function (listener) {
                this._Set_on("error", listener);
            },
            enumerable: true,
            configurable: true
        });
        /**
         * @hidden
         */
        WebSocket.prototype._Set_on = function (type, listener) {
            if (this.on_[type])
                this.removeEventListener(type, this.on_[type]);
            this.addEventListener(type, listener);
            this.on_[type] = listener;
        };
        /* ----------------------------------------------------------------
            SOCKET HANDLERS
        ---------------------------------------------------------------- */
        /**
         * @hidden
         */
        WebSocket.prototype._Handle_connect = function (connection) {
            this.connection_ = connection;
            this.state_ = WebSocket.OPEN;
            this.connection_.on("message", this._Handle_message.bind(this));
            this.connection_.on("error", this._Handle_error.bind(this));
            this.connection_.on("close", this._Handle_close.bind(this));
            var event = new Event_1.Event("open", EVENT_INIT);
            this.dispatchEvent(event);
        };
        /**
         * @hidden
         */
        WebSocket.prototype._Handle_close = function (code, reason) {
            var event = new CloseEvent_1.CloseEvent("close", __assign({}, EVENT_INIT, { code: code, reason: reason }));
            this.state_ = WebSocket.CLOSED;
            this.dispatchEvent(event);
        };
        /**
         * @hidden
         */
        WebSocket.prototype._Handle_message = function (message) {
            var event = new MessageEvent_1.MessageEvent("message", __assign({}, EVENT_INIT, { data: message.binaryData
                    ? message.binaryData
                    : message.utf8Data }));
            this.dispatchEvent(event);
        };
        /**
         * @hidden
         */
        WebSocket.prototype._Handle_error = function (error) {
            var event = new ErrorEvent_1.ErrorEvent("error", __assign({}, EVENT_INIT, { error: error, message: error.message }));
            if (this.state_ === WebSocket.CONNECTING)
                this.state_ = WebSocket.CLOSED;
            this.dispatchEvent(event);
        };
        return WebSocket;
    }(EventTarget_1.EventTarget));
    exports.WebSocket = WebSocket;
    (function (WebSocket) {
        WebSocket.CONNECTING = 0;
        WebSocket.OPEN = 1;
        WebSocket.CLOSING = 2;
        WebSocket.CLOSED = 3;
    })(WebSocket = exports.WebSocket || (exports.WebSocket = {}));
    exports.WebSocket = WebSocket;
    var EVENT_INIT = {
        bubbles: false,
        cancelable: false
    };
    //# sourceMappingURL=WebSocket.js.map
    });

    if (node.is_node())
        commonjsGlobal.WebSocket = WebSocket_1.WebSocket;

    class EventBuffer {
        constructor() {
            this.profiles = new Map();
            this.userIdeas = new Map();  // to store idea ids by user
            this.categoryIdeas = new Map();  // to store idea ids by category
            this.ideas = new Map();
        }

        // Hinzufügen eines Profils zur Map
        addProfile(profile) {
            if (!profile) {
                return;
            }
            const timestamp = Date.now();
            this.profiles.set(profile.pubkey, { profile, timestamp });
            console.log("Profile added:", this.profiles.get(profile.pubkey));
        }

        // Abrufen eines Profils aus der Map, sofern es nicht älter als eine Stunde ist
        getProfile(pubkey) {
            const profileData = this.profiles.get(pubkey);
            if (profileData) {
                const oneHour = 60 * 60 * 1000; // Zeit in Millisekunden
                if (Date.now() - profileData.timestamp < oneHour) {
                    return profileData.profile;
                }
            }
            return undefined;
        }

        addIdea(idea) {
            if (!idea) {
                return;
            }
            // If the idea is already in the map, don't add it again
            if (this.ideas.has(idea.id)) {
                return;
            }
            console.log("addIdea:", idea);
            this.ideas.set(idea.id, idea);

            // Add idea to user's set of ideas
            const userIdeaSet = this.userIdeas.get(idea.pubkey) || new Set();
            userIdeaSet.add(idea.id);
            this.userIdeas.set(idea.pubkey, userIdeaSet);

            // Add idea to each category's set of ideas
            idea.tags.forEach(tag => {
                if (tag[0] === 'c') {  // Assuming category is denoted by 'c'
                    const categoryIdeaSet = this.categoryIdeas.get(tag[1]) || new Set();
                    categoryIdeaSet.add(idea.id);
                    this.categoryIdeas.set(tag[1], categoryIdeaSet);
                }
            });
        }

        // Get all ideas of a user
        getUserIdeas(userId) {
            const userIdeaIds = this.userIdeas.get(userId);
            return Array.from(userIdeaIds || []).map(id => this.ideas.get(id));
        }

        // Get all ideas in a category
        getCategoryIdeas(category) {
            if (!category) {
                let allIdeas = new Set();
                for (let categoryIdeaIds of this.categoryIdeas.values()) {
                    Array.from(categoryIdeaIds).forEach(id => allIdeas.add(this.ideas.get(id)));
                }
                return Array.from(allIdeas);
            } else {
                const categoryIdeaIds = this.categoryIdeas.get(category[0]);
                return Array.from(categoryIdeaIds || []).map(id => this.ideas.get(id));
            }
        }
    }

    // helperStore.js

    const helperStore = writable(null);
    const sidebarOpen = writable(false);

    //import {SimplePool, generatePrivateKey, getPublicKey, getEventHash, signEvent, validateEvent, verifySignature} from 'nostr-tools'
    const { SimplePool, generatePrivateKey, getPublicKey, getEventHash, signEvent, validateEvent, verifySignature, nip19 } = window.NostrTools;

    class NostrHelper {
      constructor(write_mode) {
        this.pool = new SimplePool();
        this.relays = [];//get set by initialize()
        this.idea_kind = 1339;
        this.write_mode = write_mode;
        this.publicKey = null;
        this.publicRelays = [];
        this.clientRelays = [];
        this.eventBuffer = new EventBuffer();
        this.lastFetchTimeIdea = 0;
      }

      async getPublicRelaysString() {
        return ["wss://relay.damus.io",
          "wss://nostr-pub.wellorder.net",
          "wss://nostr.bitcoiner.social"];
      }

      async getRelaysString(pubkey) {
        // Get relays from getRelays function
        let relaysFromGetRelays = await this.getRelays(pubkey);
        // Transform it to include only relay URLs
        relaysFromGetRelays = relaysFromGetRelays.map(relay => relay[1]);
        this.clientRelays = relaysFromGetRelays;
        return relaysFromGetRelays
      }

      async getAllRelays(pubkey) {
        // Get relays from getRelays function
        let relaysFromGetRelays = await this.getRelaysString(pubkey);

        // Get relays from getPublicRelays function
        let relaysFromGetPublicRelays = await this.getPublicRelaysString();

        // Combine both relay lists
        let allRelays = relaysFromGetRelays.concat(relaysFromGetPublicRelays);

        // Remove duplicates
        allRelays = [...new Set(allRelays)];

        return allRelays;
      }

      async getPublicRelays() {
        if (!this.extensionAvailable()) return; // Do nothing in read-only mode
        let relayObject = await window.nostr.getRelays();
        let relayList = [];

        for (let key in relayObject) {
          let relay = [key, relayObject[key].read, relayObject[key].write];
          relayList.push(relay);
        }

        return relayList;
      }

      async getRelays(pubkey) {
        // Get all events of kind 10002 (Relay List Metadata) authored by the given pubkey
        const events = await this.pool.list(this.relays, [
          {
            kinds: [10002],
            'authors': [pubkey]
          }
        ]);

        // If no events were found, return an empty array
        if (events.length === 0) {
          return [];
        }

        // Otherwise, take the first (most recent) event
        const event = events[0];
        console.log("event:", event);
        // The relay URLs are stored in 'r' tags of the event
        const relayTags = event.tags.filter(tag => tag[0] === 'r');

        return relayTags;
      }

      async addRelay(relay_url) {
        if (!this.write_mode) return; // Do nothing in read-only mode
        // Get the original Relay List Metadata event
        let originalRelays = await this.getRelays(this.publicKey);
        originalRelays = originalRelays || [];

        // Check if the relay_url already exists in the original relays
        const exists = originalRelays.find(relay => relay[1] === relay_url);
        // If the relay_url already exists, return
        if (exists) return;

        // Add the new relay to the list
        originalRelays.push(["r", relay_url]);

        // Create the relay list metadata event
        const relayListEvent = this.createEvent(10002, "", originalRelays);

        // Send the relay list metadata event
        try {
          await this.sendEvent(relayListEvent);
          // If the addition was successful, add it to clientRelays
          this.clientRelays.push(relay_url);
        } catch (error) {
          console.error("Error adding relay:", error);
        }
      }

      async deleteRelay(relay_url) {
        if (!this.write_mode) return; // Do nothing in read-only mode

        // Get the original Relay List Metadata event
        let originalRelays = await this.getRelays(this.publicKey);

        originalRelays = originalRelays || [];

        // Filter out the relay_url from the original relays
        const updatedRelays = originalRelays.filter(relay => relay[1] !== relay_url);

        // Create the relay list metadata event
        const relayListEvent = this.createEvent(10002, "", updatedRelays);

        try {
          // Send the relay list metadata event
          await this.sendEvent(relayListEvent);

          // Update the clientRelays array if the deletion was successful
          this.clientRelays = this.clientRelays.filter(relay => relay !== relay_url);
        } catch (error) {
          console.error("Error deleting relay:", error);
        }
      }

      async extensionAvailable() {
        if ("nostr" in window) {
          return true;
        }
        return false;
      }

      async initialize() {
        let useExtension = await this.extensionAvailable();
        console.error("useExtension:", useExtension);
        if (this.write_mode && useExtension) {
          this.publicKey = await window.nostr.getPublicKey();
          this.relays = await this.getPublicRelaysString(); //fetch from the public first
          this.relays = await this.getAllRelays(this.publicKey); //do it again since relays changed now.
          console.log("used relays:", this.relays);
        }
        else {
          this.write_mode = false;
          this.relays = await this.getPublicRelaysString(); //fetch from the public first
        }
      }

      async sendEvent(event) {
        if (!this.write_mode) return; // Do nothing in read-only mode
        if (!this.extensionAvailable()) return;

        event.tags.push(["s", "bitspark"]);
        event = await window.nostr.signEvent(event);

        event.tags = uniqueTags(event.tags);
        this.pool.publish(this.relays, event);
        console.log("send event:", event);
        return event.id;
      }

      async getEvent(event_id) {
        const event = await this.pool.get(this.relays, { ids: [event_id] });
        return event; // return the first event (should only be one event with this id)
      }

      createEvent(kind, content, tags) {
        const event = {
          pubkey: this.publicKey,
          created_at: Math.floor(Date.now() / 1000),
          kind,
          content,
          tags,
        };

        return event;
      }

      async deleteEvent(event_id) {
        if (!this.write_mode) return; // Do nothing in read-only mode

        let tags = [["e", event_id]];

        const deleteEvent = this.createEvent(5, "", tags);
        console.log("Event deleted:", event_id);
        return await this.sendEvent(deleteEvent);
      }

      async isDeleted(event_id) {
        let filters = [{ kinds: [5], '#s': ['bitspark'], '#e': [event_id] }];

        let deleted = await this.pool.list(this.relays, filters);
        console.log(deleted);
      }

      // Get all ideas of a user
      async getUserIdeas(userId) {
        return this.eventBuffer.getUserIdeas(userId);
      }

      async postIdea(ideaName, ideaSubtitle, abstract, content, bannerUrl, githubRepo, lnAdress, categories) {
        if (!this.write_mode) return; // Do nothing in read-only mode
        let tags = [
          ["iName", ideaName],
          ["iSub", ideaSubtitle],
          ["ibUrl", bannerUrl],
          ["gitrepo", githubRepo],
          ["lnadress", lnAdress],
          ["abstract", abstract]

        ];

        // Add each category to the tags
        categories.forEach(category => {
          tags.push(["c", category]);
        });

        const ideaEvent = this.createEvent(this.idea_kind, content, tags);
        console.log("Idea Posted");
        return await this.sendEvent(ideaEvent);
      }

      async getIdeas(categories = []) {
        if (categories.length == 0) {
          categories = undefined;
        }

        let ret = this.eventBuffer.getCategoryIdeas(categories);
        console.log("getIdeas:", ret);

        return ret;
      }

      async fetchIdeas() {
        const now = Date.now();
        const thresh = 10000; // 10 seconds in milliseconds
        // Check if it's been less than 10 seconds since the last fetch
        if (now - this.lastFetchTimeIdea < thresh) {
          console.log("fetchIdeas has been called too frequently. Please wait a bit.");
          return;
        }
        let filters = [{ kinds: [this.idea_kind], '#s': ['bitspark'] }];

        let ideas = await this.pool.list(this.relays, filters);

        // Get the profiles for each idea and store them in the ideas
        const profilePromises = ideas.map(async idea => {
          const profile = await this.getProfile(idea.pubkey);
          // Set githubVerified property for each idea
          idea.githubVerified = profile.githubVerified || false;
          // Hier speichern wir die Idee in unserem EventBuffer
          this.eventBuffer.addIdea(idea);
          return idea;
        });

        ideas = await Promise.all(profilePromises);

        console.log("fetchIdeas:", ideas);
        this.lastFetchTimeIdea = now;
        return ideas;
      }

      async getComments(event_id) {
        const filters = [
          {
            kinds: [1],
            '#e': [event_id],
            '#s': ['bitspark']
          }
        ];
        let comments = await this.pool.list(this.relays, filters);

        // Fetch the profiles for each comment and store them in the comments
        const profilePromises = comments.map(async comment => {
          const profile = await this.getProfile(comment.pubkey);
          comment.name = profile.name || 'NoName';
          comment.picture = profile.picture || '';
          return comment;
        });
        comments = await Promise.all(profilePromises);

        console.log("getComments()");
        return comments;
      }

      async postComment(event_id, comment) {
        if (!this.write_mode) return; // Do nothing in read-only mode

        const tags = [
          ["e", event_id]
        ];

        const commentEvent = this.createEvent(1, comment, tags);
        console.log("postComment()");
        return await this.sendEvent(commentEvent);
      }

      async likeEvent(event_id) {
        if (!this.write_mode) return; // Do nothing in read-only mode

        const tags = [
          ["e", event_id]
        ];

        const likeEvent = this.createEvent(7, "+", tags);
        console.log("likeEvent");
        return await this.sendEvent(likeEvent);
      }

      async getLikes(event_id) {
        const events = await this.pool.list(this.relays, [
          {
            kinds: [7],
            '#e': [event_id],
            '#s': ['bitspark']
          }
        ]);
        console.log("getLikes");
        return events.filter(event => event.content === "+").length;
      }

      async getGithubIdent(profile) {
        try {
          if (!profile.tags) {
            return null;
          }

          const tag = profile.tags.find(tag => tag[0] === 'i' && tag[1].startsWith('github:'));
          if (!tag) {
            return null;
          }

          // Extrahiere den Benutzernamen und den Nachweis aus dem Tag
          const githubInfo = tag[1].split(':');
          const username = githubInfo[1];
          const proof = tag[2];

          return { username, proof };
        } catch (error) {
          console.error(`Error in getGithubIdent: ${error}`);
          return null; // Return null if something goes wrong
        }
      }

      async validateGithubIdent(username, pubkey, proof) {
        try {
          const gistUrl = `https://api.github.com/gists/${proof}`;

          const response = await fetch(gistUrl, { mode: 'cors' });
          const data = await response.json();

          const nPubKey = nip19.npubEncode(pubkey);

          const expectedText = `${nPubKey}`;

          for (const file in data.files) {
            if (data.files[file].content.includes(expectedText) &&
              data.files[file].raw_url.includes(username)) {
              console.log(username, "verified!");
              return true;
            }
          }

          return false;
        } catch (error) {
          console.error(`Error in validateGithubIdent: ${error}`);
          return false;
        }
      }

      async getProfile(pubkey) {
        console.log("getProfile:", pubkey);

        // Überprüfen, ob das Profil bereits im ProfileBuffer gespeichert ist
        let profile = await this.eventBuffer.getProfile(pubkey);

        if (profile) {
          console.log("getProfile speed up:", profile);
          return profile;
        }
        else {
          console.log("buffer failed:", profile);
        }

        const events = await this.pool.list(this.relays, [
          {
            kinds: [0],
            'authors': [pubkey]
          }
        ]);

        // Wenn keine Events gefunden wurden, geben Sie ein leeres Objekt zurück
        if (events.length === 0) {
          return { 'pubkey': pubkey };
        }

        // Ansonsten nehmen Sie das erste Event
        const event = events[0];

        // Inhalt als JSON analysieren und als Eigenschaften zum Event hinzufügen
        const content = JSON.parse(event.content);
        for (let key in content) {
          event[key] = content[key];
        }

        // Get GitHub Identity
        const githubIdent = await this.getGithubIdent(event);
        if (githubIdent) {
          event.githubUsername = githubIdent.username;
          event.githubProof = githubIdent.proof;

          // Überprüfen der Github-Verifikation und speichern des Ergebnisses in profile.githubVerified
          event.githubVerified = await this.validateGithubIdent(githubIdent.username, pubkey, githubIdent.proof);
        }

        // Den ursprünglichen content entfernen
        delete event.content;

        this.eventBuffer.addProfile(event);
        console.log("getProfile done:", event);
        return event;
      }


      async getOriginalProfile() {
        const events = await this.pool.list(this.relays, [
          {
            kinds: [0],
            'authors': [this.publicKey]
          }
        ]);

        // Return the first event (there should only be one event with this id)
        return events[0];
      }

      async updateProfile(name, picture, banner, dev_about, lnurl, identities = []) {
        console.log("updateProfile");
        if (!this.write_mode) return; // Do nothing in read-only mode

        // Get the original profile event
        const originalEvent = await this.getOriginalProfile();

        // Parse the content and merge it with the new data
        const originalContent = JSON.parse(originalEvent.content);
        const newContent = {
          ...originalContent,
          name,
          picture,
          banner,
          dev_about,
          lnurl,
        };

        // Convert the updated content back to a JSON string
        const contentStr = JSON.stringify(newContent);

        // Create the tags list by transforming the identity proofs into the required format
        const tags = identities.map(identity => ['i', `${identity.platform}:${identity.identity}`, identity.proof]);

        const combinedTags = [...tags];

        // Update the original event's content and tags
        const profileEvent = this.createEvent(0, contentStr, combinedTags);
        let ret = await this.sendEvent(profileEvent);
        console.log("Profile Update done:", profileEvent);
        return ret;
      }
    }

    function uniqueTags(tags) {
      // Convert each tag array to a string and put it in a set.
      const tagSet = new Set(tags.map(tag => JSON.stringify(tag)));

      // Convert the set back to an array of arrays.
      const uniqueTags = Array.from(tagSet).map(tagStr => JSON.parse(tagStr));
      
      return uniqueTags;
    }

    let storedInstance = null;

    NostrHelper.create = async function (write_mode) {
      // Get stored object.
      helperStore.subscribe(value => { storedInstance = value; })();
      
      // If not in storage, create one.
      if (storedInstance === null) {
        const instance = new NostrHelper(write_mode);
        await instance.initialize();
        helperStore.set(instance);
        storedInstance = instance;
        return storedInstance;
      }

      // Wenn write_mode definiert ist, erstelle eine neue Instanz und speichere sie im Store.
      if (write_mode !== undefined) {
        if(storedInstance.write_mode != write_mode) {
          storedInstance.write_mode = write_mode;
          await storedInstance.initialize();
          helperStore.set(storedInstance);
        }
      }

      // Gibt die Instanz aus dem Store zurück
      return storedInstance;
    };

    function styleInject(css, ref) {
      if ( ref === void 0 ) ref = {};
      var insertAt = ref.insertAt;

      if (!css || typeof document === 'undefined') { return; }

      var head = document.head || document.getElementsByTagName('head')[0];
      var style = document.createElement('style');
      style.type = 'text/css';

      if (insertAt === 'top') {
        if (head.firstChild) {
          head.insertBefore(style, head.firstChild);
        } else {
          head.appendChild(style);
        }
      } else {
        head.appendChild(style);
      }

      if (style.styleSheet) {
        style.styleSheet.cssText = css;
      } else {
        style.appendChild(document.createTextNode(css));
      }
    }

    var css_248z$7 = ".toggle-button.svelte-1e4y9sx.svelte-1e4y9sx{display:flex;justify-content:center;align-items:center}.menu-card.svelte-1e4y9sx.svelte-1e4y9sx{width:200px;margin-top:80px;color:#000;position:relative}.menu-item.svelte-1e4y9sx.svelte-1e4y9sx{color:#103f70;font-size:1rem;padding:15px;padding-left:30px;cursor:pointer;transition:color 0.3s;display:block;text-decoration:none;outline:none;width:200px;text-align:left}.menu-item.svelte-1e4y9sx.svelte-1e4y9sx:hover{color:#EB6F1A;text-decoration:none;outline:none}.category-style.svelte-1e4y9sx.svelte-1e4y9sx{font-size:1rem;padding:15px;padding-left:15px;cursor:pointer;transition:color 0.3s;display:block;text-decoration:none;color:#494949;outline:none;width:200px;text-align:left}.category-style.svelte-1e4y9sx.svelte-1e4y9sx:hover{color:#60adff;text-decoration:none;outline:none}.categories-wrapper.svelte-1e4y9sx.svelte-1e4y9sx{position:fixed;left:180px;background:#d1d1d1;width:310px;max-height:100vh;height:100vh;padding:10px 0;box-shadow:0px 10px 30px -5px rgba(0, 0, 0, 0.3);border-radius:20px;transition:opacity 0.3s, visibility 0.3s;opacity:1;visibility:visible;z-index:50;padding-top:14px;padding-bottom:14px}.categories-wrapper.hidden.svelte-1e4y9sx.svelte-1e4y9sx{opacity:0;visibility:hidden}.categories-outer.svelte-1e4y9sx.svelte-1e4y9sx{width:100%;max-height:100%;overflow-y:auto;border-radius:20px}.categories.svelte-1e4y9sx.svelte-1e4y9sx{width:100%}.categories.hidden.svelte-1e4y9sx.svelte-1e4y9sx{opacity:0;visibility:hidden}.category-item.svelte-1e4y9sx.svelte-1e4y9sx{color:#000;padding:10px 15px;cursor:pointer;transition:color 0.3s}.category-item.svelte-1e4y9sx.svelte-1e4y9sx:hover{color:#007bff}.hide.svelte-1e4y9sx.svelte-1e4y9sx{display:none}.button-container.svelte-1e4y9sx.svelte-1e4y9sx{position:fixed;top:0;left:0;z-index:11;background-color:#333333;display:flex;justify-content:center;align-items:center;border-radius:10%;padding:5px;margin:10px}svg.svelte-1e4y9sx path.svelte-1e4y9sx{fill:#d1d1d1}.menu-container.svelte-1e4y9sx.svelte-1e4y9sx{position:fixed;top:0;left:0;width:200px;min-width:200px;z-index:10;flex-basis:200px;background-color:rgba(255, 255, 255, 0.5);opacity:3.7;height:100vh;overflow-y:auto;transform:translateX(-100%);transition:transform 0.3s ease-in-out}.menu-container.show.svelte-1e4y9sx.svelte-1e4y9sx{transform:translateX(0)}button.svelte-1e4y9sx.svelte-1e4y9sx:focus{outline:none}.svelte-1e4y9sx.svelte-1e4y9sx::-webkit-scrollbar{width:10px;height:10px}.svelte-1e4y9sx.svelte-1e4y9sx::-webkit-scrollbar-track{background:#f1f1f1;border-radius:20px}.svelte-1e4y9sx.svelte-1e4y9sx::-webkit-scrollbar-thumb{background:#888;border-radius:20px}.svelte-1e4y9sx.svelte-1e4y9sx::-webkit-scrollbar-thumb:hover{background:#555}.categories.svelte-1e4y9sx.svelte-1e4y9sx::-webkit-scrollbar{width:10px}.categories.svelte-1e4y9sx.svelte-1e4y9sx::-webkit-scrollbar-track{background:#f1f1f1}.categories.svelte-1e4y9sx.svelte-1e4y9sx::-webkit-scrollbar-thumb{background:#888;border-radius:20px}.categories.svelte-1e4y9sx.svelte-1e4y9sx::-webkit-scrollbar-thumb:hover{background:#555}.divider-line.svelte-1e4y9sx.svelte-1e4y9sx{margin-left:12%;border-top:1px solid #d1d1d1;padding:1px;width:76%}";
    styleInject(css_248z$7);

    /* src/components/Menu.svelte generated by Svelte v3.59.1 */

    function get_each_context$6(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[20] = list[i];
    	return child_ctx;
    }

    // (135:12) {#if $menuState.logged_in}
    function create_if_block_2$1(ctx) {
    	let hr;
    	let t0;
    	let li0;
    	let button0;
    	let t1;
    	let t2;
    	let li1;
    	let button1;
    	let t3;
    	let mounted;
    	let dispose;

    	return {
    		c() {
    			hr = element("hr");
    			t0 = space();
    			li0 = element("li");
    			button0 = element("button");
    			t1 = text("Profile");
    			t2 = space();
    			li1 = element("li");
    			button1 = element("button");
    			t3 = text("Edit Profile");
    			attr(hr, "class", "divider-line svelte-1e4y9sx");
    			attr(button0, "class", "" + (null_to_empty(linkStyle) + " svelte-1e4y9sx"));
    			attr(li0, "class", "svelte-1e4y9sx");
    			attr(button1, "class", "" + (null_to_empty(linkStyle) + " svelte-1e4y9sx"));
    			attr(li1, "class", "svelte-1e4y9sx");
    		},
    		m(target, anchor) {
    			insert(target, hr, anchor);
    			insert(target, t0, anchor);
    			insert(target, li0, anchor);
    			append(li0, button0);
    			append(button0, t1);
    			insert(target, t2, anchor);
    			insert(target, li1, anchor);
    			append(li1, button1);
    			append(button1, t3);

    			if (!mounted) {
    				dispose = [
    					listen(button0, "click", /*click_handler_2*/ ctx[15]),
    					listen(button1, "click", /*click_handler_3*/ ctx[16])
    				];

    				mounted = true;
    			}
    		},
    		p: noop,
    		d(detaching) {
    			if (detaching) detach(hr);
    			if (detaching) detach(t0);
    			if (detaching) detach(li0);
    			if (detaching) detach(t2);
    			if (detaching) detach(li1);
    			mounted = false;
    			run_all(dispose);
    		}
    	};
    }

    // (168:16) {:else}
    function create_else_block(ctx) {
    	let button;
    	let t;
    	let mounted;
    	let dispose;

    	return {
    		c() {
    			button = element("button");
    			t = text("Login");
    			attr(button, "class", "" + (null_to_empty(linkStyle) + " svelte-1e4y9sx"));
    		},
    		m(target, anchor) {
    			insert(target, button, anchor);
    			append(button, t);

    			if (!mounted) {
    				dispose = [
    					listen(button, "click", /*login*/ ctx[11]),
    					listen(button, "keydown", /*login*/ ctx[11])
    				];

    				mounted = true;
    			}
    		},
    		p: noop,
    		d(detaching) {
    			if (detaching) detach(button);
    			mounted = false;
    			run_all(dispose);
    		}
    	};
    }

    // (162:47) 
    function create_if_block_1$4(ctx) {
    	let button;
    	let t;
    	let mounted;
    	let dispose;

    	return {
    		c() {
    			button = element("button");
    			t = text("Logout");
    			attr(button, "class", "" + (null_to_empty(linkStyle) + " svelte-1e4y9sx"));
    		},
    		m(target, anchor) {
    			insert(target, button, anchor);
    			append(button, t);

    			if (!mounted) {
    				dispose = [
    					listen(button, "click", /*logout*/ ctx[12]),
    					listen(button, "keydown", /*logout*/ ctx[12])
    				];

    				mounted = true;
    			}
    		},
    		p: noop,
    		d(detaching) {
    			if (detaching) detach(button);
    			mounted = false;
    			run_all(dispose);
    		}
    	};
    }

    // (156:16) {#if !$menuState.use_extension}
    function create_if_block$5(ctx) {
    	let button;
    	let t;
    	let mounted;
    	let dispose;

    	return {
    		c() {
    			button = element("button");
    			t = text(optionText);
    			attr(button, "class", "" + (null_to_empty(linkStyle) + " svelte-1e4y9sx"));
    		},
    		m(target, anchor) {
    			insert(target, button, anchor);
    			append(button, t);

    			if (!mounted) {
    				dispose = listen(button, "click", /*click_handler_4*/ ctx[17]);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d(detaching) {
    			if (detaching) detach(button);
    			mounted = false;
    			dispose();
    		}
    	};
    }

    // (188:12) {#each categories as category}
    function create_each_block$6(ctx) {
    	let button;
    	let t_value = /*category*/ ctx[20] + "";
    	let t;
    	let mounted;
    	let dispose;

    	function click_handler_5() {
    		return /*click_handler_5*/ ctx[18](/*category*/ ctx[20]);
    	}

    	return {
    		c() {
    			button = element("button");
    			t = text(t_value);
    			attr(button, "class", "" + (null_to_empty(categoryStyle) + " svelte-1e4y9sx"));
    		},
    		m(target, anchor) {
    			insert(target, button, anchor);
    			append(button, t);

    			if (!mounted) {
    				dispose = listen(button, "click", click_handler_5);
    				mounted = true;
    			}
    		},
    		p(new_ctx, dirty) {
    			ctx = new_ctx;
    		},
    		d(detaching) {
    			if (detaching) detach(button);
    			mounted = false;
    			dispose();
    		}
    	};
    }

    function create_fragment$a(ctx) {
    	let div0;
    	let button0;
    	let t0;
    	let div3;
    	let div2;
    	let ul;
    	let li0;
    	let button1;
    	let t1;
    	let t2;
    	let li1;
    	let div1;
    	let span;
    	let t3;
    	let t4;
    	let hr0;
    	let t5;
    	let li2;
    	let button2;
    	let t6;
    	let t7;
    	let t8;
    	let li3;
    	let hr1;
    	let t9;
    	let t10;
    	let div6;
    	let div5;
    	let div4;
    	let div6_class_value;
    	let mounted;
    	let dispose;
    	let if_block0 = /*$menuState*/ ctx[3].logged_in && create_if_block_2$1(ctx);

    	function select_block_type(ctx, dirty) {
    		if (!/*$menuState*/ ctx[3].use_extension) return create_if_block$5;
    		if (/*$menuState*/ ctx[3].logged_in) return create_if_block_1$4;
    		return create_else_block;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block1 = current_block_type(ctx);
    	let each_value = /*categories*/ ctx[6];
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$6(get_each_context$6(ctx, each_value, i));
    	}

    	return {
    		c() {
    			div0 = element("div");
    			button0 = element("button");
    			button0.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" viewBox="0 2 16 14" class="svelte-1e4y9sx"><path d="M1 3h14a1 1 0 0 1 0 2H1a1 1 0 1 1 0-2zm0 5h14a1 1 0 0 1 0 2H1a1 1 0 0 1 0-2zm0 5h14a1 1 0 0 1 0 2H1a1 1 0 0 1 0-2z" class="svelte-1e4y9sx"></path></svg>`;
    			t0 = space();
    			div3 = element("div");
    			div2 = element("div");
    			ul = element("ul");
    			li0 = element("li");
    			button1 = element("button");
    			t1 = text("BitSpark");
    			t2 = space();
    			li1 = element("li");
    			div1 = element("div");
    			span = element("span");
    			t3 = text("Categories");
    			t4 = space();
    			hr0 = element("hr");
    			t5 = space();
    			li2 = element("li");
    			button2 = element("button");
    			t6 = text("Spark Idea");
    			t7 = space();
    			if (if_block0) if_block0.c();
    			t8 = space();
    			li3 = element("li");
    			hr1 = element("hr");
    			t9 = space();
    			if_block1.c();
    			t10 = space();
    			div6 = element("div");
    			div5 = element("div");
    			div4 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr(button0, "class", "toggle-button svelte-1e4y9sx");
    			attr(div0, "class", "button-container svelte-1e4y9sx");
    			attr(button1, "class", "" + (null_to_empty(linkStyle) + " svelte-1e4y9sx"));
    			attr(li0, "class", "svelte-1e4y9sx");
    			attr(span, "class", "" + (null_to_empty(linkStyle) + " svelte-1e4y9sx"));
    			attr(div1, "class", "svelte-1e4y9sx");
    			attr(li1, "class", "svelte-1e4y9sx");
    			attr(hr0, "class", "divider-line svelte-1e4y9sx");
    			attr(button2, "class", "" + (null_to_empty(linkStyle) + " svelte-1e4y9sx"));
    			attr(li2, "class", "svelte-1e4y9sx");
    			attr(hr1, "class", "divider-line svelte-1e4y9sx");
    			attr(li3, "class", "svelte-1e4y9sx");
    			attr(ul, "class", "flex flex-col items-start svelte-1e4y9sx");
    			attr(div2, "class", "menu-card svelte-1e4y9sx");
    			attr(div3, "class", "menu-container svelte-1e4y9sx");
    			toggle_class(div3, "show", /*$sidebarOpen*/ ctx[2]);
    			attr(div4, "class", "categories svelte-1e4y9sx");
    			attr(div5, "class", "categories-outer svelte-1e4y9sx");

    			attr(div6, "class", div6_class_value = "" + (null_to_empty(/*showCategories*/ ctx[1]
    			? "categories-wrapper"
    			: "categories-wrapper hidden") + " svelte-1e4y9sx"));
    		},
    		m(target, anchor) {
    			insert(target, div0, anchor);
    			append(div0, button0);
    			insert(target, t0, anchor);
    			insert(target, div3, anchor);
    			append(div3, div2);
    			append(div2, ul);
    			append(ul, li0);
    			append(li0, button1);
    			append(button1, t1);
    			append(ul, t2);
    			append(ul, li1);
    			append(li1, div1);
    			append(div1, span);
    			append(span, t3);
    			append(ul, t4);
    			append(ul, hr0);
    			append(ul, t5);
    			append(ul, li2);
    			append(li2, button2);
    			append(button2, t6);
    			append(ul, t7);
    			if (if_block0) if_block0.m(ul, null);
    			append(ul, t8);
    			append(ul, li3);
    			append(li3, hr1);
    			append(li3, t9);
    			if_block1.m(li3, null);
    			insert(target, t10, anchor);
    			insert(target, div6, anchor);
    			append(div6, div5);
    			append(div5, div4);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				if (each_blocks[i]) {
    					each_blocks[i].m(div4, null);
    				}
    			}

    			if (!mounted) {
    				dispose = [
    					listen(button0, "click", /*toggleSidebar*/ ctx[4]),
    					listen(button1, "click", /*click_handler*/ ctx[13]),
    					listen(div1, "mouseover", /*handleMouseOver*/ ctx[7]),
    					listen(div1, "mouseout", /*handleMouseOut*/ ctx[8]),
    					listen(div1, "focus", /*handleFocus*/ ctx[9]),
    					listen(div1, "blur", /*handleBlur*/ ctx[10]),
    					listen(button2, "click", /*click_handler_1*/ ctx[14]),
    					listen(div6, "mouseover", /*handleMouseOver*/ ctx[7]),
    					listen(div6, "mouseout", /*handleMouseOut*/ ctx[8]),
    					listen(div6, "focus", /*handleFocus*/ ctx[9]),
    					listen(div6, "blur", /*handleBlur*/ ctx[10])
    				];

    				mounted = true;
    			}
    		},
    		p(ctx, [dirty]) {
    			if (/*$menuState*/ ctx[3].logged_in) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_2$1(ctx);
    					if_block0.c();
    					if_block0.m(ul, t8);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block1) {
    				if_block1.p(ctx, dirty);
    			} else {
    				if_block1.d(1);
    				if_block1 = current_block_type(ctx);

    				if (if_block1) {
    					if_block1.c();
    					if_block1.m(li3, null);
    				}
    			}

    			if (dirty & /*$sidebarOpen*/ 4) {
    				toggle_class(div3, "show", /*$sidebarOpen*/ ctx[2]);
    			}

    			if (dirty & /*categoryStyle, navigate, categories*/ 64) {
    				each_value = /*categories*/ ctx[6];
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$6(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$6(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div4, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty & /*showCategories*/ 2 && div6_class_value !== (div6_class_value = "" + (null_to_empty(/*showCategories*/ ctx[1]
    			? "categories-wrapper"
    			: "categories-wrapper hidden") + " svelte-1e4y9sx"))) {
    				attr(div6, "class", div6_class_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d(detaching) {
    			if (detaching) detach(div0);
    			if (detaching) detach(t0);
    			if (detaching) detach(div3);
    			if (if_block0) if_block0.d();
    			if_block1.d();
    			if (detaching) detach(t10);
    			if (detaching) detach(div6);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};
    }

    let optionText = "getAlby";
    let linkStyle = "block menu-item";
    let categoryStyle = "category-style";

    function instance$9($$self, $$props, $$invalidate) {
    	let $sidebarOpen;
    	let $menuState;
    	component_subscribe($$self, sidebarOpen, $$value => $$invalidate(2, $sidebarOpen = $$value));

    	function toggleSidebar() {
    		sidebarOpen.update(value => !value);
    	}

    	const menuState = writable({ logged_in: false, use_extension: false });
    	component_subscribe($$self, menuState, value => $$invalidate(3, $menuState = value));
    	let nostrHelper = null;

    	let categories = [
    		"Art & Design",
    		"Bitcoin & P2P",
    		"Comics & Graphic Novels",
    		"Crafts & DIY",
    		"Fashion & Beauty",
    		"Film, Video & Animation",
    		"Food & Beverages",
    		"Games & Gaming",
    		"Health & Fitness",
    		"Journalism & News",
    		"Music & Audio",
    		"Photography & Visual Arts",
    		"Publishing & Writing",
    		"Technology & Software",
    		"Education & Learning",
    		"Environment & Sustainability",
    		"Sports & Outdoors",
    		"Travel & Tourism",
    		"Non-Profit & Social Causes",
    		"Business & Entrepreneurship",
    		"Science & Research",
    		"Home & Lifestyle",
    		"Automotive & Transportation",
    		"Pets & Animals",
    		"Parenting & Family"
    	];

    	let showCategories = false;
    	let timeoutId;

    	function handleMouseOver() {
    		clearTimeout(timeoutId);
    		$$invalidate(1, showCategories = true);
    	}

    	function handleMouseOut() {
    		timeoutId = setTimeout(
    			() => {
    				$$invalidate(1, showCategories = false);
    			},
    			200
    		); // 200ms delay before hiding categories
    	}

    	function handleFocus() {
    		$$invalidate(1, showCategories = true);
    	}

    	function handleBlur() {
    		$$invalidate(1, showCategories = false);
    	}

    	async function login() {
    		// Warten Sie darauf, dass NostrHelper.create aufgelöst ist, bevor Sie fortfahren
    		console.log("Logging in...");

    		await NostrHelper.create(true);
    		menuState.update(state => ({ ...state, logged_in: true }));
    	}

    	async function logout() {
    		console.log("Logging out...");
    		await NostrHelper.create(false);
    		menuState.update(state => ({ ...state, logged_in: false }));
    	}

    	onMount(async () => {
    		$$invalidate(0, nostrHelper = await NostrHelper.create());
    		const loggedIn = await nostrHelper.publicKey != null;
    		const usingExtension = await nostrHelper.extensionAvailable();

    		menuState.set({
    			logged_in: loggedIn,
    			use_extension: usingExtension
    		});
    	});

    	const click_handler = () => navigate("/");
    	const click_handler_1 = () => navigate("/postidea");
    	const click_handler_2 = () => navigate(`/profile/${nostrHelper.publicKey}`);
    	const click_handler_3 = () => navigate(`/edit_profile/${nostrHelper.publicKey}`);
    	const click_handler_4 = () => navigate("https://getalby.com/");
    	const click_handler_5 = category => navigate(`/overview/${category}`);

    	return [
    		nostrHelper,
    		showCategories,
    		$sidebarOpen,
    		$menuState,
    		toggleSidebar,
    		menuState,
    		categories,
    		handleMouseOver,
    		handleMouseOut,
    		handleFocus,
    		handleBlur,
    		login,
    		logout,
    		click_handler,
    		click_handler_1,
    		click_handler_2,
    		click_handler_3,
    		click_handler_4,
    		click_handler_5
    	];
    }

    class Menu extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$9, create_fragment$a, safe_not_equal, {});
    	}
    }

    var css_248z$6 = "footer.svelte-xvy9l7{position:relative;z-index:10;background-color:white}";
    styleInject(css_248z$6);

    /* src/components/Footers/FooterBS.svelte generated by Svelte v3.59.1 */

    function create_fragment$9(ctx) {
    	let footer;

    	return {
    		c() {
    			footer = element("footer");

    			footer.innerHTML = `<div class="container mx-auto px-4"><hr class="mb-4 border-b-1 border-blueGray-200"/> 
    <div class="flex flex-wrap items-center md:justify-between justify-center"><div class="w-full px-4"><ul class="flex flex-wrap list-none md:justify-center justify-center"><li><a href="https://lightning.network/lightning-network-paper.pdf" class="text-blueGray-600 hover:text-blueGray-800 text-sm font-semibold block py-1 px-3">Powered by Lightning</a></li> 
          <li><a href="https://nostr.com/" class="text-blueGray-600 hover:text-blueGray-800 text-sm font-semibold block py-1 px-3">Powered by Nostr</a></li> 
          <li><a href="https://getalby.com/" class="text-blueGray-600 hover:text-blueGray-800 text-sm font-semibold block py-1 px-3">Powered by Alby</a></li> 
          <li><a href="https://www.creative-tim.com?ref=ns-footer-admin" class="text-blueGray-600 hover:text-blueGray-800 text-sm font-semibold block py-1 px-3">Creative Tim</a></li> 
          <li><a href="https://github.com/creativetimofficial/notus-svelte/blob/main/LICENSE.md?ref=ns-footer-admin" class="text-blueGray-600 hover:text-blueGray-800 text-sm font-semibold block py-1 px-3">MIT License</a></li></ul></div></div></div>`;

    			attr(footer, "class", "block py-4 footer svelte-xvy9l7");
    			attr(footer, "id", "myFooter");
    		},
    		m(target, anchor) {
    			insert(target, footer, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d(detaching) {
    			if (detaching) detach(footer);
    		}
    	};
    }

    function instance$8($$self) {
    	new Date().getFullYear();
    	return [];
    }

    class FooterBS extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$8, create_fragment$9, safe_not_equal, {});
    	}
    }

    // Initialisiert den Store mit einem leeren Array
    const ideas = writable([]);
    const verifiedCards = writable([]);
    const unverifiedCards = writable([]);

    var css_248z$5 = ".content-section.svelte-sbrvtz{display:flex;background-color:#e2e8f0 !important}.content-container.svelte-sbrvtz{flex-grow:1;z-index:0}.title-class.svelte-sbrvtz{position:absolute;left:0;right:0;top:1/2;transition:left 0.3s ease-in-out;left:30px}.title-class.sidebar-open.svelte-sbrvtz{left:215px}.flex-grow.svelte-sbrvtz{z-index:0}.content-container.svelte-sbrvtz{margin-left:0;transition:margin-left 0.3s ease-in-out;flex-grow:1;z-index:0}.content-container.sidebar-open.svelte-sbrvtz{margin-left:200px}";
    styleInject(css_248z$5);

    /* src/views/Overview.svelte generated by Svelte v3.59.1 */

    function get_each_context$5(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[16] = list[i];
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[16] = list[i];
    	return child_ctx;
    }

    // (188:18) {#each $verifiedCards as card (card.id)}
    function create_each_block_1(key_1, ctx) {
    	let div;
    	let ideacard;
    	let t;
    	let current;
    	ideacard = new IdeaCard({ props: { card: /*card*/ ctx[16] } });

    	return {
    		key: key_1,
    		first: null,
    		c() {
    			div = element("div");
    			create_component(ideacard.$$.fragment);
    			t = space();
    			attr(div, "class", "col-12 col-sm-6 col-md-6 col-lg-6 mb-8");
    			set_style(div, "margin-bottom", "2rem");
    			this.first = div;
    		},
    		m(target, anchor) {
    			insert(target, div, anchor);
    			mount_component(ideacard, div, null);
    			append(div, t);
    			current = true;
    		},
    		p(new_ctx, dirty) {
    			ctx = new_ctx;
    			const ideacard_changes = {};
    			if (dirty & /*$verifiedCards*/ 8) ideacard_changes.card = /*card*/ ctx[16];
    			ideacard.$set(ideacard_changes);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(ideacard.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(ideacard.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(div);
    			destroy_component(ideacard);
    		}
    	};
    }

    // (203:18) {#each $unverifiedCards as card (card.id)}
    function create_each_block$5(key_1, ctx) {
    	let div;
    	let ideacard;
    	let t;
    	let current;
    	ideacard = new IdeaCard({ props: { card: /*card*/ ctx[16] } });

    	return {
    		key: key_1,
    		first: null,
    		c() {
    			div = element("div");
    			create_component(ideacard.$$.fragment);
    			t = space();
    			attr(div, "class", "col-12 col-sm-6 col-md-6 col-lg-6 mb-8");
    			set_style(div, "margin-top", "2rem");
    			this.first = div;
    		},
    		m(target, anchor) {
    			insert(target, div, anchor);
    			mount_component(ideacard, div, null);
    			append(div, t);
    			current = true;
    		},
    		p(new_ctx, dirty) {
    			ctx = new_ctx;
    			const ideacard_changes = {};
    			if (dirty & /*$unverifiedCards*/ 4) ideacard_changes.card = /*card*/ ctx[16];
    			ideacard.$set(ideacard_changes);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(ideacard.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(ideacard.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(div);
    			destroy_component(ideacard);
    		}
    	};
    }

    function create_fragment$8(ctx) {
    	let div15;
    	let main;
    	let div14;
    	let menu;
    	let t0;
    	let div13;
    	let section0;
    	let div6;
    	let span0;
    	let t1;
    	let div4;
    	let div1;
    	let div0;
    	let h1;
    	let t3;
    	let h2;
    	let div0_class_value;
    	let t5;
    	let div3;
    	let t11;
    	let div5;
    	let t12;
    	let div12;
    	let section1;
    	let div11;
    	let div10;
    	let div7;
    	let each_blocks_1 = [];
    	let each0_lookup = new Map();
    	let t13;
    	let div8;
    	let t14;
    	let div9;
    	let each_blocks = [];
    	let each1_lookup = new Map();
    	let t15;
    	let footer;
    	let div12_class_value;
    	let current;
    	menu = new Menu({});
    	let each_value_1 = /*$verifiedCards*/ ctx[3];
    	const get_key = ctx => /*card*/ ctx[16].id;

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		let child_ctx = get_each_context_1(ctx, each_value_1, i);
    		let key = get_key(child_ctx);
    		each0_lookup.set(key, each_blocks_1[i] = create_each_block_1(key, child_ctx));
    	}

    	let each_value = /*$unverifiedCards*/ ctx[2];
    	const get_key_1 = ctx => /*card*/ ctx[16].id;

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$5(ctx, each_value, i);
    		let key = get_key_1(child_ctx);
    		each1_lookup.set(key, each_blocks[i] = create_each_block$5(key, child_ctx));
    	}

    	footer = new FooterBS({});

    	return {
    		c() {
    			div15 = element("div");
    			main = element("main");
    			div14 = element("div");
    			create_component(menu.$$.fragment);
    			t0 = space();
    			div13 = element("div");
    			section0 = element("section");
    			div6 = element("div");
    			span0 = element("span");
    			t1 = space();
    			div4 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			h1 = element("h1");
    			h1.textContent = "BitSpark";
    			t3 = space();
    			h2 = element("h2");
    			h2.innerHTML = `<span class="ml-2">The idea engine</span>`;
    			t5 = space();
    			div3 = element("div");

    			div3.innerHTML = `<div class="text-4xl font-light text-white"><p class="text-5xl leading-tight" style="opacity: 0.3; margin-bottom: -0.4rem;">ignite ideas.</p> 
                      <p class="text-5xl leading-tight" style="opacity: 1; margin-left: -2.8rem;">ignite <span class="text-orange-500">change</span>.</p></div>`;

    			t11 = space();
    			div5 = element("div");
    			div5.innerHTML = `<svg class="absolute bottom-0 overflow-hidden" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" version="1.1" viewBox="0 0 2560 100" x="0" y="0"><polygon class="text-blueGray-200 fill-current" points="2560 0 2560 100 0 100"></polygon></svg>`;
    			t12 = space();
    			div12 = element("div");
    			section1 = element("section");
    			div11 = element("div");
    			div10 = element("div");
    			div7 = element("div");

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t13 = space();
    			div8 = element("div");
    			t14 = space();
    			div9 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t15 = space();
    			create_component(footer.$$.fragment);
    			attr(span0, "id", "blackOverlay");
    			attr(span0, "class", "w-full h-full absolute opacity-50 bg-black");
    			attr(h1, "class", "text-8xl font-bold text-white mr-4 mb-0;");
    			attr(h2, "class", "text-4xl font-light text-white mt-0");
    			set_style(h2, "line-height", "0.9");
    			attr(div0, "class", div0_class_value = "" + (null_to_empty(/*titleClass*/ ctx[1]) + " svelte-sbrvtz"));
    			attr(div1, "class", "flex flex-col items-start");
    			set_style(div1, "margin-top", "10rem");
    			set_style(div1, "margin-left", "10rem");
    			attr(div3, "class", "absolute top-4 right-4 flex justify-end");
    			attr(div4, "class", "absolute left-0 right-0 top-1/2 transform -translate-y-1/2 px-4 flex flex-col items-start justify-center h-full");
    			attr(div5, "class", "top-auto bottom-0 left-0 right-0 w-full absolute pointer-events-none overflow-hidden h-70-px");
    			set_style(div5, "transform", "translateZ(0)");
    			attr(div6, "class", "absolute top-0 w-full h-full bg-center bg-cover");
    			set_style(div6, "background-image", "url(../../img/Banner1u.png)");
    			attr(section0, "class", "relative block h-500-px");
    			attr(div7, "class", "row");
    			set_style(div8, "margin-top", "2rem");
    			set_style(div8, "margin-bottom", "2rem");
    			set_style(div8, "height", "2px");
    			set_style(div8, "background-color", "gray");
    			attr(div8, "class", "w-full");
    			attr(div9, "class", "row");
    			attr(div10, "class", "container mx-auto px-4");
    			attr(div11, "class", "content-container svelte-sbrvtz");
    			attr(section1, "class", "content-container relative py-16 bg-blueGray-200 svelte-sbrvtz");
    			attr(div12, "class", div12_class_value = "" + (null_to_empty(/*contentContainerClass*/ ctx[0]) + " svelte-sbrvtz"));
    			attr(div13, "class", "flex-grow svelte-sbrvtz");
    			attr(div14, "class", "flex");
    			attr(main, "class", "overview-page bg-blueGray-200");
    			set_style(div15, "position", "relative");
    		},
    		m(target, anchor) {
    			insert(target, div15, anchor);
    			append(div15, main);
    			append(main, div14);
    			mount_component(menu, div14, null);
    			append(div14, t0);
    			append(div14, div13);
    			append(div13, section0);
    			append(section0, div6);
    			append(div6, span0);
    			append(div6, t1);
    			append(div6, div4);
    			append(div4, div1);
    			append(div1, div0);
    			append(div0, h1);
    			append(div0, t3);
    			append(div0, h2);
    			append(div4, t5);
    			append(div4, div3);
    			append(div6, t11);
    			append(div6, div5);
    			append(div13, t12);
    			append(div13, div12);
    			append(div12, section1);
    			append(section1, div11);
    			append(div11, div10);
    			append(div10, div7);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				if (each_blocks_1[i]) {
    					each_blocks_1[i].m(div7, null);
    				}
    			}

    			append(div10, t13);
    			append(div10, div8);
    			append(div10, t14);
    			append(div10, div9);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				if (each_blocks[i]) {
    					each_blocks[i].m(div9, null);
    				}
    			}

    			append(div12, t15);
    			mount_component(footer, div12, null);
    			current = true;
    		},
    		p(ctx, [dirty]) {
    			if (!current || dirty & /*titleClass*/ 2 && div0_class_value !== (div0_class_value = "" + (null_to_empty(/*titleClass*/ ctx[1]) + " svelte-sbrvtz"))) {
    				attr(div0, "class", div0_class_value);
    			}

    			if (dirty & /*$verifiedCards*/ 8) {
    				each_value_1 = /*$verifiedCards*/ ctx[3];
    				group_outros();
    				each_blocks_1 = update_keyed_each(each_blocks_1, dirty, get_key, 1, ctx, each_value_1, each0_lookup, div7, outro_and_destroy_block, create_each_block_1, null, get_each_context_1);
    				check_outros();
    			}

    			if (dirty & /*$unverifiedCards*/ 4) {
    				each_value = /*$unverifiedCards*/ ctx[2];
    				group_outros();
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key_1, 1, ctx, each_value, each1_lookup, div9, outro_and_destroy_block, create_each_block$5, null, get_each_context$5);
    				check_outros();
    			}

    			if (!current || dirty & /*contentContainerClass*/ 1 && div12_class_value !== (div12_class_value = "" + (null_to_empty(/*contentContainerClass*/ ctx[0]) + " svelte-sbrvtz"))) {
    				attr(div12, "class", div12_class_value);
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(menu.$$.fragment, local);

    			for (let i = 0; i < each_value_1.length; i += 1) {
    				transition_in(each_blocks_1[i]);
    			}

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			transition_in(footer.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(menu.$$.fragment, local);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				transition_out(each_blocks_1[i]);
    			}

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			transition_out(footer.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(div15);
    			destroy_component(menu);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].d();
    			}

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}

    			destroy_component(footer);
    		}
    	};
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let $sidebarOpen;
    	let $helperStore;
    	let $ideas;
    	let $unverifiedCards;
    	let $verifiedCards;
    	component_subscribe($$self, sidebarOpen, $$value => $$invalidate(5, $sidebarOpen = $$value));
    	component_subscribe($$self, helperStore, $$value => $$invalidate(6, $helperStore = $$value));
    	component_subscribe($$self, ideas, $$value => $$invalidate(7, $ideas = $$value));
    	component_subscribe($$self, unverifiedCards, $$value => $$invalidate(2, $unverifiedCards = $$value));
    	component_subscribe($$self, verifiedCards, $$value => $$invalidate(3, $verifiedCards = $$value));

    	let publicKey = "";
    	let profile = null;
    	let { category } = $$props;

    	async function fetchIdeas() {
    		if (!$helperStore) {
    			return;
    		}

    		try {
    			await $helperStore.fetchIdeas();

    			if (category) {
    				set_store_value(ideas, $ideas = await $helperStore.getIdeas([category]), $ideas);
    			} else {
    				set_store_value(ideas, $ideas = await $helperStore.getIdeas(), $ideas);
    			}
    		} catch(error) {
    			console.error("Error updating cards:", error);
    		}
    	}

    	async function filterIdeas() {
    		if (!$helperStore) {
    			return;
    		}

    		if (category) {
    			set_store_value(ideas, $ideas = await $helperStore.getIdeas([category]), $ideas);
    		} else {
    			set_store_value(ideas, $ideas = await $helperStore.getIdeas(), $ideas);
    		}
    	}

    	async function updateProfileImg() {
    		if (!$helperStore) {
    			return;
    		}

    		publicKey = $helperStore.publicKey;
    		profile = await $helperStore.getProfile(publicKey);
    		profile.picture;
    	}

    	async function updateIdeas() {
    		try {
    			let verified = [];
    			let unverified = [];

    			$ideas.forEach(idea => {
    				const tags = idea.tags.reduce((tagObj, [key, value]) => ({ ...tagObj, [key]: value }), {});

    				const card = {
    					id: idea.id,
    					name: tags.iName,
    					subtitle: tags.iSub,
    					bannerImage: tags.ibUrl,
    					message: idea.content,
    					abstract: tags.abstract
    				};

    				if (idea.githubVerified) {
    					verified.push(card);
    				} else {
    					unverified.push(card);
    				}
    			});

    			// Assign outside of forEach loop
    			set_store_value(verifiedCards, $verifiedCards = verified, $verifiedCards);

    			set_store_value(unverifiedCards, $unverifiedCards = unverified, $unverifiedCards);
    		} catch(error) {
    			console.error("Error updating cards:", error);
    		}
    	}

    	onMount(async () => {
    		
    	});

    	let contentContainerClass = "content-container";
    	let titleClass = "title-class";

    	$$self.$$set = $$props => {
    		if ('category' in $$props) $$invalidate(4, category = $$props.category);
    	};

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*category*/ 16) {
    			(filterIdeas(), category);
    		}

    		if ($$self.$$.dirty & /*$ideas*/ 128) {
    			(updateIdeas(), $ideas);
    		}

    		if ($$self.$$.dirty & /*$helperStore*/ 64) {
    			(updateProfileImg(), $helperStore);
    		}

    		if ($$self.$$.dirty & /*$helperStore*/ 64) {
    			(fetchIdeas(), $helperStore);
    		}

    		if ($$self.$$.dirty & /*$helperStore*/ 64) {
    			(filterIdeas(), $helperStore);
    		}

    		if ($$self.$$.dirty & /*$sidebarOpen*/ 32) {
    			{
    				if ($sidebarOpen) {
    					$$invalidate(0, contentContainerClass = "content-container sidebar-open");
    					$$invalidate(1, titleClass = "title-class sidebar-open");
    				} else {
    					$$invalidate(0, contentContainerClass = "content-container");
    					$$invalidate(1, titleClass = "title-class");
    				}
    			}
    		}
    	};

    	return [
    		contentContainerClass,
    		titleClass,
    		$unverifiedCards,
    		$verifiedCards,
    		category,
    		$sidebarOpen,
    		$helperStore,
    		$ideas
    	];
    }

    class Overview extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$7, create_fragment$8, safe_not_equal, { category: 4 });
    	}
    }

    async function sendSatsLNurl(lnurl) {
        if (typeof window.webln !== "undefined") {
          await window.webln.enable();
          await webln.lnurl(lnurl);
        }
      }

    var css_248z$4 = ".content-section.svelte-sbrvtz{display:flex;background-color:#e2e8f0 !important}.content-container.svelte-sbrvtz{flex-grow:1;z-index:0}.title-class.svelte-sbrvtz{position:absolute;left:0;right:0;top:1/2;transition:left 0.3s ease-in-out;left:30px}.title-class.sidebar-open.svelte-sbrvtz{left:215px}.flex-grow.svelte-sbrvtz{z-index:0}.content-container.svelte-sbrvtz{margin-left:0;transition:margin-left 0.3s ease-in-out;flex-grow:1;z-index:0}.content-container.sidebar-open.svelte-sbrvtz{margin-left:200px}";
    styleInject(css_248z$4);

    /* src/views/IdeaDetail.svelte generated by Svelte v3.59.1 */

    function get_each_context$4(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[17] = list[i];
    	return child_ctx;
    }

    // (159:16) {#if creator_profile && creator_profile.picture}
    function create_if_block_2(ctx) {
    	let div;
    	let profileimg;
    	let current;

    	profileimg = new ProfileImg({
    			props: {
    				profile: /*creator_profile*/ ctx[3],
    				style: { width: "40px", height: "40px" }
    			}
    		});

    	return {
    		c() {
    			div = element("div");
    			create_component(profileimg.$$.fragment);
    			set_style(div, "margin-right", "10px");
    		},
    		m(target, anchor) {
    			insert(target, div, anchor);
    			mount_component(profileimg, div, null);
    			current = true;
    		},
    		p(ctx, dirty) {
    			const profileimg_changes = {};
    			if (dirty & /*creator_profile*/ 8) profileimg_changes.profile = /*creator_profile*/ ctx[3];
    			profileimg.$set(profileimg_changes);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(profileimg.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(profileimg.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(div);
    			destroy_component(profileimg);
    		}
    	};
    }

    // (204:16) {#if creator_profile && creator_profile.pubkey === $helperStore.publicKey}
    function create_if_block_1$3(ctx) {
    	let button;
    	let mounted;
    	let dispose;

    	return {
    		c() {
    			button = element("button");
    			button.innerHTML = `<i class="fas fa-times-circle"></i>`;
    			attr(button, "class", "absolute top-4 right-4 text-gray-400");
    		},
    		m(target, anchor) {
    			insert(target, button, anchor);

    			if (!mounted) {
    				dispose = listen(button, "click", /*deleteIdea*/ ctx[7]);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d(detaching) {
    			if (detaching) detach(button);
    			mounted = false;
    			dispose();
    		}
    	};
    }

    // (272:22) {#if comment.picture}
    function create_if_block$4(ctx) {
    	let div;
    	let profileimg;
    	let current;

    	profileimg = new ProfileImg({
    			props: {
    				profile: /*comment*/ ctx[17],
    				style: { width: "40px", height: "40px" }
    			}
    		});

    	return {
    		c() {
    			div = element("div");
    			create_component(profileimg.$$.fragment);
    			set_style(div, "margin-right", "10px");
    		},
    		m(target, anchor) {
    			insert(target, div, anchor);
    			mount_component(profileimg, div, null);
    			current = true;
    		},
    		p(ctx, dirty) {
    			const profileimg_changes = {};
    			if (dirty & /*comments*/ 2) profileimg_changes.profile = /*comment*/ ctx[17];
    			profileimg.$set(profileimg_changes);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(profileimg.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(profileimg.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(div);
    			destroy_component(profileimg);
    		}
    	};
    }

    // (270:18) {#each comments as comment (comment.id)}
    function create_each_block$4(key_1, ctx) {
    	let li;
    	let t0;
    	let div;
    	let h3;
    	let t1_value = /*comment*/ ctx[17].name + "";
    	let t1;
    	let t2;
    	let p;
    	let t3_value = /*comment*/ ctx[17].comment + "";
    	let t3;
    	let t4;
    	let current;
    	let if_block = /*comment*/ ctx[17].picture && create_if_block$4(ctx);

    	return {
    		key: key_1,
    		first: null,
    		c() {
    			li = element("li");
    			if (if_block) if_block.c();
    			t0 = space();
    			div = element("div");
    			h3 = element("h3");
    			t1 = text(t1_value);
    			t2 = space();
    			p = element("p");
    			t3 = text(t3_value);
    			t4 = space();
    			attr(h3, "class", "font-bold text-sm");
    			attr(p, "class", "text-m");
    			attr(li, "class", "flex items-center gap-4 my-2");
    			this.first = li;
    		},
    		m(target, anchor) {
    			insert(target, li, anchor);
    			if (if_block) if_block.m(li, null);
    			append(li, t0);
    			append(li, div);
    			append(div, h3);
    			append(h3, t1);
    			append(div, t2);
    			append(div, p);
    			append(p, t3);
    			append(li, t4);
    			current = true;
    		},
    		p(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (/*comment*/ ctx[17].picture) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*comments*/ 2) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$4(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(li, t0);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}

    			if ((!current || dirty & /*comments*/ 2) && t1_value !== (t1_value = /*comment*/ ctx[17].name + "")) set_data(t1, t1_value);
    			if ((!current || dirty & /*comments*/ 2) && t3_value !== (t3_value = /*comment*/ ctx[17].comment + "")) set_data(t3, t3_value);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(li);
    			if (if_block) if_block.d();
    		}
    	};
    }

    // (306:14) <Link to="/overview">
    function create_default_slot$3(ctx) {
    	let button;

    	return {
    		c() {
    			button = element("button");
    			button.textContent = "Back";
    			attr(button, "class", "bg-red-400 active:bg-red-500 uppercase text-white font-bold hover:shadow-md shadow text-xs px-4 py-2 rounded outline-none focus:outline-none mb-1 ease-linear transition-all duration-150");
    			attr(button, "type", "button");
    		},
    		m(target, anchor) {
    			insert(target, button, anchor);
    		},
    		p: noop,
    		d(detaching) {
    			if (detaching) detach(button);
    		}
    	};
    }

    function create_fragment$7(ctx) {
    	let div15;
    	let main;
    	let div14;
    	let menu;
    	let t0;
    	let div13;
    	let section0;
    	let div3;
    	let span;
    	let t1;
    	let div2;
    	let div0;
    	let h1;
    	let t2_value = /*idea*/ ctx[0].name + "";
    	let t2;
    	let t3;
    	let h20;
    	let t4_value = /*idea*/ ctx[0].subtitle + "";
    	let t4;
    	let div0_class_value;
    	let t5;
    	let div1;
    	let button0;
    	let t6;
    	let t7;
    	let a;
    	let i;
    	let a_href_value;
    	let t8;
    	let div4;
    	let t9;
    	let div12;
    	let section1;
    	let div11;
    	let div8;
    	let t10;
    	let div7;
    	let div6;
    	let h3;
    	let t11_value = /*idea*/ ctx[0].name + "";
    	let t11;
    	let t12;
    	let h21;
    	let t14;
    	let p0;
    	let t15_value = /*idea*/ ctx[0].abstract + "";
    	let t15;
    	let t16;
    	let hr0;
    	let t17;
    	let h22;
    	let t18_value = /*idea*/ ctx[0].name + "";
    	let t18;
    	let t19;
    	let p1;
    	let raw_value = /*idea*/ ctx[0].message + "";
    	let t20;
    	let hr1;
    	let t21;
    	let div5;
    	let p2;
    	let t23;
    	let button1;
    	let t24;
    	let div10;
    	let h4;
    	let t26;
    	let ul;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let t27;
    	let div9;
    	let label;
    	let t29;
    	let textarea;
    	let t30;
    	let button2;
    	let t32;
    	let link;
    	let t33;
    	let footer;
    	let div12_class_value;
    	let current;
    	let mounted;
    	let dispose;
    	menu = new Menu({});
    	let if_block0 = /*creator_profile*/ ctx[3] && /*creator_profile*/ ctx[3].picture && create_if_block_2(ctx);
    	let if_block1 = /*creator_profile*/ ctx[3] && /*creator_profile*/ ctx[3].pubkey === /*$helperStore*/ ctx[6].publicKey && create_if_block_1$3(ctx);
    	let each_value = /*comments*/ ctx[1];
    	const get_key = ctx => /*comment*/ ctx[17].id;

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$4(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block$4(key, child_ctx));
    	}

    	link = new Link({
    			props: {
    				to: "/overview",
    				$$slots: { default: [create_default_slot$3] },
    				$$scope: { ctx }
    			}
    		});

    	footer = new FooterBS({});

    	return {
    		c() {
    			div15 = element("div");
    			main = element("main");
    			div14 = element("div");
    			create_component(menu.$$.fragment);
    			t0 = space();
    			div13 = element("div");
    			section0 = element("section");
    			div3 = element("div");
    			span = element("span");
    			t1 = space();
    			div2 = element("div");
    			div0 = element("div");
    			h1 = element("h1");
    			t2 = text(t2_value);
    			t3 = space();
    			h20 = element("h2");
    			t4 = text(t4_value);
    			t5 = space();
    			div1 = element("div");
    			button0 = element("button");
    			button0.innerHTML = `<img src="../../img/lightning.png" style="height: 2.5rem; width: 2.5rem;" alt="Support via Bitcoin Lightning"/>`;
    			t6 = space();
    			if (if_block0) if_block0.c();
    			t7 = space();
    			a = element("a");
    			i = element("i");
    			t8 = space();
    			div4 = element("div");
    			div4.innerHTML = `<svg class="absolute bottom-0 overflow-hidden" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" version="1.1" viewBox="0 0 2560 100" x="0" y="0"><polygon class="text-blueGray-200 fill-current" points="2560 0 2560 100 0 100"></polygon></svg>`;
    			t9 = space();
    			div12 = element("div");
    			section1 = element("section");
    			div11 = element("div");
    			div8 = element("div");
    			if (if_block1) if_block1.c();
    			t10 = space();
    			div7 = element("div");
    			div6 = element("div");
    			h3 = element("h3");
    			t11 = text(t11_value);
    			t12 = space();
    			h21 = element("h2");
    			h21.textContent = `${"Abstract"}`;
    			t14 = space();
    			p0 = element("p");
    			t15 = text(t15_value);
    			t16 = space();
    			hr0 = element("hr");
    			t17 = space();
    			h22 = element("h2");
    			t18 = text(t18_value);
    			t19 = space();
    			p1 = element("p");
    			t20 = space();
    			hr1 = element("hr");
    			t21 = space();
    			div5 = element("div");
    			p2 = element("p");
    			p2.textContent = "Support via";
    			t23 = space();
    			button1 = element("button");
    			button1.innerHTML = `<img src="/img/lightning.png" style="height: 2.5rem; width: 2.5rem;" alt="Support via Bitcoin Lightning"/>`;
    			t24 = space();
    			div10 = element("div");
    			h4 = element("h4");
    			h4.textContent = "Comments";
    			t26 = space();
    			ul = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t27 = space();
    			div9 = element("div");
    			label = element("label");
    			label.textContent = "Your Comment:";
    			t29 = space();
    			textarea = element("textarea");
    			t30 = space();
    			button2 = element("button");
    			button2.textContent = "Send";
    			t32 = space();
    			create_component(link.$$.fragment);
    			t33 = space();
    			create_component(footer.$$.fragment);
    			attr(span, "id", "blackOverlay");
    			attr(span, "class", "w-full h-full absolute opacity-50 bg-black");
    			attr(h1, "class", "text-4xl font-bold text-white");
    			attr(h20, "class", "text-2xl font-light text-white");
    			attr(div0, "class", div0_class_value = "" + (null_to_empty(/*titleClass*/ ctx[5]) + " svelte-sbrvtz"));
    			set_style(button0, "padding", "0");
    			attr(i, "class", "fab fa-github text-white");
    			set_style(i, "font-size", "2.5rem");
    			attr(a, "href", a_href_value = /*idea*/ ctx[0].githubRepo);
    			attr(a, "target", "_blank");
    			attr(div1, "class", "absolute top-4 right-4 text-3xl text-white flex justify-end items-center gap-6");
    			attr(div2, "class", "absolute left-0 right-0 top-1/2 transform -translate-y-1/2 px-4 flex flex-col items-start justify-center h-full");
    			attr(div3, "class", "absolute top-0 w-full h-full bg-center bg-cover");
    			set_style(div3, "background-image", "url(" + /*idea*/ ctx[0].bannerImage + ")");
    			attr(div4, "class", "top-auto bottom-0 left-0 right-0 w-full absolute pointer-events-none overflow-hidden h-70-px");
    			set_style(div4, "transform", "translateZ(0)");
    			attr(section0, "class", "relative block h-500-px");
    			attr(h3, "class", "text-4xl font-semibold leading-normal mb-2 text-blueGray-700");
    			attr(h21, "class", "text-4xl font-semibold leading-normal mb-2 text-blueGray-700 mt-6");
    			attr(p0, "class", "message-text");
    			set_style(p0, "width", "70%");
    			set_style(p0, "margin", "2rem auto");
    			set_style(p0, "text-align", "justify");
    			set_style(p0, "font-size", "1.2em");
    			set_style(p0, "line-height", "1.6em");
    			attr(hr0, "class", "my-6");
    			attr(h22, "class", "text-4xl font-semibold leading-normal mb-2 text-blueGray-700 mt-6");
    			attr(p1, "class", "message-text");
    			set_style(p1, "width", "70%");
    			set_style(p1, "margin", "0 auto");
    			set_style(p1, "text-align", "justify");
    			attr(hr1, "class", "my-4");
    			attr(p2, "class", "mb-0");
    			set_style(button1, "padding", "0");
    			set_style(button1, "display", "flex");
    			set_style(button1, "align-items", "center");
    			attr(div5, "class", "flex items-center justify-center gap-4 mb-4");
    			attr(div6, "class", "text-center mt-6");
    			attr(div7, "class", "px-6");
    			attr(div8, "class", "relative flex flex-col min-w-0 break-words bg-white w-full mb-6 shadow-xl rounded-lg");
    			attr(h4, "class", "text-2xl font-semibold text-blueGray-700 mb-4");
    			attr(label, "for", "newComment");
    			attr(label, "class", "text-lg text-blueGray-600");
    			attr(textarea, "id", "newComment");
    			attr(textarea, "class", "w-full h-24 p-2 mt-2 rounded-md border-2 border-blueGray-200");
    			attr(textarea, "placeholder", "Schreibe hier deinen Kommentar...");
    			attr(button2, "class", "bg-red-400 active:bg-red-500 uppercase text-white font-bold hover:shadow-md shadow text-xs px-4 py-2 rounded outline-none focus:outline-none mt-4 mb-1 ease-linear transition-all duration-150");
    			attr(button2, "type", "button");
    			attr(div9, "class", "mt-6");
    			attr(div10, "class", "bg-white w-full mb-6 shadow-xl rounded-lg p-4");
    			attr(div11, "class", "container mx-auto px-4");
    			attr(section1, "class", "relative py-16 bg-blueGray-200");
    			attr(div12, "class", div12_class_value = "" + (null_to_empty(/*contentContainerClass*/ ctx[4]) + " svelte-sbrvtz"));
    			attr(div13, "class", "flex-grow svelte-sbrvtz");
    			attr(div14, "class", "flex");
    			attr(main, "class", "overview-page bg-blueGray-200");
    			set_style(div15, "position", "relative");
    		},
    		m(target, anchor) {
    			insert(target, div15, anchor);
    			append(div15, main);
    			append(main, div14);
    			mount_component(menu, div14, null);
    			append(div14, t0);
    			append(div14, div13);
    			append(div13, section0);
    			append(section0, div3);
    			append(div3, span);
    			append(div3, t1);
    			append(div3, div2);
    			append(div2, div0);
    			append(div0, h1);
    			append(h1, t2);
    			append(div0, t3);
    			append(div0, h20);
    			append(h20, t4);
    			append(div2, t5);
    			append(div2, div1);
    			append(div1, button0);
    			append(div1, t6);
    			if (if_block0) if_block0.m(div1, null);
    			append(div1, t7);
    			append(div1, a);
    			append(a, i);
    			append(section0, t8);
    			append(section0, div4);
    			append(div13, t9);
    			append(div13, div12);
    			append(div12, section1);
    			append(section1, div11);
    			append(div11, div8);
    			if (if_block1) if_block1.m(div8, null);
    			append(div8, t10);
    			append(div8, div7);
    			append(div7, div6);
    			append(div6, h3);
    			append(h3, t11);
    			append(div6, t12);
    			append(div6, h21);
    			append(div6, t14);
    			append(div6, p0);
    			append(p0, t15);
    			append(div6, t16);
    			append(div6, hr0);
    			append(div6, t17);
    			append(div6, h22);
    			append(h22, t18);
    			append(div6, t19);
    			append(div6, p1);
    			p1.innerHTML = raw_value;
    			append(div6, t20);
    			append(div6, hr1);
    			append(div6, t21);
    			append(div6, div5);
    			append(div5, p2);
    			append(div5, t23);
    			append(div5, button1);
    			append(div11, t24);
    			append(div11, div10);
    			append(div10, h4);
    			append(div10, t26);
    			append(div10, ul);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				if (each_blocks[i]) {
    					each_blocks[i].m(ul, null);
    				}
    			}

    			append(div10, t27);
    			append(div10, div9);
    			append(div9, label);
    			append(div9, t29);
    			append(div9, textarea);
    			set_input_value(textarea, /*newComment*/ ctx[2]);
    			append(div9, t30);
    			append(div9, button2);
    			append(div11, t32);
    			mount_component(link, div11, null);
    			append(div12, t33);
    			mount_component(footer, div12, null);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen(button0, "click", /*supportIdea*/ ctx[8]),
    					listen(button1, "click", /*supportIdea*/ ctx[8]),
    					listen(textarea, "input", /*textarea_input_handler*/ ctx[12]),
    					listen(button2, "click", /*submitComment*/ ctx[9])
    				];

    				mounted = true;
    			}
    		},
    		p(ctx, [dirty]) {
    			if ((!current || dirty & /*idea*/ 1) && t2_value !== (t2_value = /*idea*/ ctx[0].name + "")) set_data(t2, t2_value);
    			if ((!current || dirty & /*idea*/ 1) && t4_value !== (t4_value = /*idea*/ ctx[0].subtitle + "")) set_data(t4, t4_value);

    			if (!current || dirty & /*titleClass*/ 32 && div0_class_value !== (div0_class_value = "" + (null_to_empty(/*titleClass*/ ctx[5]) + " svelte-sbrvtz"))) {
    				attr(div0, "class", div0_class_value);
    			}

    			if (/*creator_profile*/ ctx[3] && /*creator_profile*/ ctx[3].picture) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);

    					if (dirty & /*creator_profile*/ 8) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_2(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(div1, t7);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			if (!current || dirty & /*idea*/ 1 && a_href_value !== (a_href_value = /*idea*/ ctx[0].githubRepo)) {
    				attr(a, "href", a_href_value);
    			}

    			if (!current || dirty & /*idea*/ 1) {
    				set_style(div3, "background-image", "url(" + /*idea*/ ctx[0].bannerImage + ")");
    			}

    			if (/*creator_profile*/ ctx[3] && /*creator_profile*/ ctx[3].pubkey === /*$helperStore*/ ctx[6].publicKey) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_1$3(ctx);
    					if_block1.c();
    					if_block1.m(div8, t10);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if ((!current || dirty & /*idea*/ 1) && t11_value !== (t11_value = /*idea*/ ctx[0].name + "")) set_data(t11, t11_value);
    			if ((!current || dirty & /*idea*/ 1) && t15_value !== (t15_value = /*idea*/ ctx[0].abstract + "")) set_data(t15, t15_value);
    			if ((!current || dirty & /*idea*/ 1) && t18_value !== (t18_value = /*idea*/ ctx[0].name + "")) set_data(t18, t18_value);
    			if ((!current || dirty & /*idea*/ 1) && raw_value !== (raw_value = /*idea*/ ctx[0].message + "")) p1.innerHTML = raw_value;
    			if (dirty & /*comments*/ 2) {
    				each_value = /*comments*/ ctx[1];
    				group_outros();
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, ul, outro_and_destroy_block, create_each_block$4, null, get_each_context$4);
    				check_outros();
    			}

    			if (dirty & /*newComment*/ 4) {
    				set_input_value(textarea, /*newComment*/ ctx[2]);
    			}

    			const link_changes = {};

    			if (dirty & /*$$scope*/ 1048576) {
    				link_changes.$$scope = { dirty, ctx };
    			}

    			link.$set(link_changes);

    			if (!current || dirty & /*contentContainerClass*/ 16 && div12_class_value !== (div12_class_value = "" + (null_to_empty(/*contentContainerClass*/ ctx[4]) + " svelte-sbrvtz"))) {
    				attr(div12, "class", div12_class_value);
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(menu.$$.fragment, local);
    			transition_in(if_block0);

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			transition_in(link.$$.fragment, local);
    			transition_in(footer.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(menu.$$.fragment, local);
    			transition_out(if_block0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			transition_out(link.$$.fragment, local);
    			transition_out(footer.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(div15);
    			destroy_component(menu);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}

    			destroy_component(link);
    			destroy_component(footer);
    			mounted = false;
    			run_all(dispose);
    		}
    	};
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let $sidebarOpen;
    	let $helperStore;
    	component_subscribe($$self, sidebarOpen, $$value => $$invalidate(11, $sidebarOpen = $$value));
    	component_subscribe($$self, helperStore, $$value => $$invalidate(6, $helperStore = $$value));

    	let { id } = $$props;

    	let idea = {
    		bannerImage: "https://images.unsplash.com/photo-1499336315816-097655dcfbda?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=2710&q=80",
    		id: 0,
    		message: "Eine innovative App, die das Leben der Menschen verbessert.",
    		name: "Innovative App",
    		subtitle: "Idea Engine"
    	};

    	let comments = [];
    	let newComment = "";
    	let profiles = {};
    	let creator_profile = null;

    	async function deleteIdea() {
    		const confirmDelete = confirm("Do you really want to delete this idea?");

    		if (confirmDelete) {
    			try {
    				await $helperStore.deleteEvent(id);
    			} catch(error) {
    				console.error("Error deleting idea:", error);
    			}
    		}
    	}

    	onMount(async () => {
    		await fetchData();
    		await fetchComments();
    	});

    	async function fetchData() {
    		try {
    			const fetchedIdea = await $helperStore.getEvent(id);

    			// Konvertiere die Tags in ein einfacher zu handhabendes Objekt
    			const tags = fetchedIdea.tags.reduce((tagObj, [key, value]) => ({ ...tagObj, [key]: value }), {});

    			$$invalidate(0, idea = {
    				id: fetchedIdea.id,
    				name: tags.iName,
    				subtitle: tags.iSub,
    				bannerImage: tags.ibUrl,
    				message: fetchedIdea.content,
    				githubRepo: tags.gitrepo,
    				lnAdress: tags.lnadress,
    				pubkey: fetchedIdea.pubkey,
    				abstract: tags.abstract
    			});

    			// Laden Sie das Profil des Erstellers der Idee
    			$$invalidate(3, creator_profile = await $helperStore.getProfile(fetchedIdea.pubkey));

    			profiles[creator_profile.pubkey] = creator_profile;
    		} catch(error) {
    			console.error("Error fetching idea data:", error);
    		}
    	}

    	async function supportIdea() {
    		await sendSatsLNurl(idea.lnAdress);
    	}

    	async function fetchComments() {
    		try {
    			const fetchedComments = await $helperStore.getComments(id);

    			$$invalidate(1, comments = await Promise.all(fetchedComments.map(async comment => {
    				const profile = await $helperStore.getProfile(comment.pubkey);
    				profiles[comment.pubkey] = profile;

    				return {
    					id: comment.id,
    					comment: comment.content,
    					name: comment.name,
    					picture: profile.picture, // Benutze das geladene Profilbild
    					pubkey: comment.pubkey,
    					githubVerified: profile.githubVerified
    				};
    			})));
    		} catch(error) {
    			console.error("Error fetching comments data:", error);
    		}
    	}

    	async function submitComment() {
    		if (newComment.trim() === "") return;

    		try {
    			const commentId = await $helperStore.postComment(id, newComment);
    			await fetchComments();
    			$$invalidate(2, newComment = "");
    		} catch(error) {
    			console.error("Error submitting comment:", error);
    		}
    	}

    	let contentContainerClass = "content-container";
    	let titleClass = "title-class";

    	function textarea_input_handler() {
    		newComment = this.value;
    		$$invalidate(2, newComment);
    	}

    	$$self.$$set = $$props => {
    		if ('id' in $$props) $$invalidate(10, id = $$props.id);
    	};

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$sidebarOpen*/ 2048) {
    			{
    				if ($sidebarOpen) {
    					$$invalidate(4, contentContainerClass = "content-container sidebar-open");
    					$$invalidate(5, titleClass = "title-class sidebar-open");
    				} else {
    					$$invalidate(4, contentContainerClass = "content-container");
    					$$invalidate(5, titleClass = "title-class");
    				}
    			}
    		}
    	};

    	return [
    		idea,
    		comments,
    		newComment,
    		creator_profile,
    		contentContainerClass,
    		titleClass,
    		$helperStore,
    		deleteIdea,
    		supportIdea,
    		submitComment,
    		id,
    		$sidebarOpen,
    		textarea_input_handler
    	];
    }

    class IdeaDetail extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$6, create_fragment$7, safe_not_equal, { id: 10 });
    	}
    }

    /* src/components/Dropdowns/MultiSelectDropdown.svelte generated by Svelte v3.59.1 */

    function get_each_context$3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[8] = list[i];
    	child_ctx[9] = list;
    	child_ctx[10] = i;
    	return child_ctx;
    }

    // (30:4) {#each categories as category}
    function create_each_block$3(ctx) {
    	let label;
    	let input;
    	let t0;
    	let t1_value = /*category*/ ctx[8] + "";
    	let t1;
    	let t2;
    	let mounted;
    	let dispose;

    	function input_change_handler() {
    		/*input_change_handler*/ ctx[6].call(input, /*category*/ ctx[8]);
    	}

    	function change_handler() {
    		return /*change_handler*/ ctx[7](/*category*/ ctx[8]);
    	}

    	return {
    		c() {
    			label = element("label");
    			input = element("input");
    			t0 = space();
    			t1 = text(t1_value);
    			t2 = space();
    			attr(input, "type", "checkbox");
    			attr(input, "class", "mr-2");
    			attr(label, "class", "block px-4 py-2 hover:bg-blue-50 rounded-md");
    		},
    		m(target, anchor) {
    			insert(target, label, anchor);
    			append(label, input);
    			input.checked = /*checkboxStates*/ ctx[2][/*category*/ ctx[8]];
    			append(label, t0);
    			append(label, t1);
    			append(label, t2);

    			if (!mounted) {
    				dispose = [
    					listen(input, "change", input_change_handler),
    					listen(input, "change", change_handler)
    				];

    				mounted = true;
    			}
    		},
    		p(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty & /*checkboxStates, categories*/ 5) {
    				input.checked = /*checkboxStates*/ ctx[2][/*category*/ ctx[8]];
    			}

    			if (dirty & /*categories*/ 1 && t1_value !== (t1_value = /*category*/ ctx[8] + "")) set_data(t1, t1_value);
    		},
    		d(detaching) {
    			if (detaching) detach(label);
    			mounted = false;
    			run_all(dispose);
    		}
    	};
    }

    function create_fragment$6(ctx) {
    	let div1;
    	let button;
    	let t1;
    	let div0;
    	let div0_class_value;
    	let mounted;
    	let dispose;
    	let each_value = /*categories*/ ctx[0];
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$3(get_each_context$3(ctx, each_value, i));
    	}

    	return {
    		c() {
    			div1 = element("div");
    			button = element("button");
    			button.textContent = "Select Categories";
    			t1 = space();
    			div0 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr(button, "class", "w-full bg-white px-4 py-2 text-left border-2 border-gray-200 rounded-md");
    			attr(div0, "class", div0_class_value = "" + ((/*dropdownOpen*/ ctx[1] ? 'block' : 'hidden') + " absolute w-full bg-white border-t-0 rounded-b-md border-2 border-gray-200 z-10"));
    			attr(div1, "class", "block rounded-md border-1 border-gray-200 relative w-full");
    		},
    		m(target, anchor) {
    			insert(target, div1, anchor);
    			append(div1, button);
    			append(div1, t1);
    			append(div1, div0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				if (each_blocks[i]) {
    					each_blocks[i].m(div0, null);
    				}
    			}

    			if (!mounted) {
    				dispose = listen(button, "click", /*click_handler*/ ctx[5]);
    				mounted = true;
    			}
    		},
    		p(ctx, [dirty]) {
    			if (dirty & /*categories, checkboxStates, toggleCategory*/ 13) {
    				each_value = /*categories*/ ctx[0];
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$3(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$3(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div0, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty & /*dropdownOpen*/ 2 && div0_class_value !== (div0_class_value = "" + ((/*dropdownOpen*/ ctx[1] ? 'block' : 'hidden') + " absolute w-full bg-white border-t-0 rounded-b-md border-2 border-gray-200 z-10"))) {
    				attr(div0, "class", div0_class_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d(detaching) {
    			if (detaching) detach(div1);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			dispose();
    		}
    	};
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let { categories = [] } = $$props;
    	let { selected = [] } = $$props;
    	let dropdownOpen = false;
    	let checkboxStates = {};

    	function toggleCategory(category) {
    		const isSelected = selected.includes(category);

    		if (isSelected) {
    			$$invalidate(4, selected = selected.filter(item => item !== category));
    		} else if (selected.length < 3) {
    			$$invalidate(4, selected = [...selected, category]);
    		}
    	}

    	const click_handler = () => $$invalidate(1, dropdownOpen = !dropdownOpen);

    	function input_change_handler(category) {
    		checkboxStates[category] = this.checked;
    		(($$invalidate(2, checkboxStates), $$invalidate(0, categories)), $$invalidate(4, selected));
    	}

    	const change_handler = category => toggleCategory(category);

    	$$self.$$set = $$props => {
    		if ('categories' in $$props) $$invalidate(0, categories = $$props.categories);
    		if ('selected' in $$props) $$invalidate(4, selected = $$props.selected);
    	};

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*categories, selected*/ 17) {
    			categories.forEach(category => {
    				$$invalidate(2, checkboxStates[category] = selected.includes(category), checkboxStates);
    			});
    		}
    	};

    	return [
    		categories,
    		dropdownOpen,
    		checkboxStates,
    		toggleCategory,
    		selected,
    		click_handler,
    		input_change_handler,
    		change_handler
    	];
    }

    class MultiSelectDropdown extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$5, create_fragment$6, safe_not_equal, { categories: 0, selected: 4 });
    	}
    }

    // Definieren Sie die anfänglichen Daten
    const initialIdea = {
        name: "",
        subtitle: "",
        abstract: "",
        message: "",
        bannerUrl: "",
        githubRepo: "",
        lightningAddress: "",
        categories: [],
    };

    // Erstellen Sie den Store
    const previewStore = writable(initialIdea);

    var css_248z$3 = ".content-section.svelte-11wt8pz{display:flex;background-color:#e2e8f0 !important}.content-container.svelte-11wt8pz{flex-grow:1;z-index:0}.title-class.svelte-11wt8pz{position:absolute;left:0;right:0;top:1/2;transition:left 0.3s ease-in-out;left:30px}.title-class.sidebar-open.svelte-11wt8pz{left:215px}.flex-grow.svelte-11wt8pz{z-index:0}.content-container.svelte-11wt8pz{margin-left:0;transition:margin-left 0.3s ease-in-out;flex-grow:1;z-index:0}.content-container.sidebar-open.svelte-11wt8pz{margin-left:200px}";
    styleInject(css_248z$3);

    /* src/views/PostIdea.svelte generated by Svelte v3.59.1 */

    function create_fragment$5(ctx) {
    	let div21;
    	let main;
    	let div20;
    	let menu;
    	let t0;
    	let div19;
    	let section0;
    	let t12;
    	let div18;
    	let section1;
    	let div16;
    	let div15;
    	let h21;
    	let t14;
    	let div14;
    	let div6;
    	let input0;
    	let t15;
    	let div7;
    	let input1;
    	let t16;
    	let div8;
    	let textarea0;
    	let t17;
    	let div9;
    	let textarea1;
    	let t18;
    	let div10;
    	let input2;
    	let t19;
    	let div11;
    	let input3;
    	let t20;
    	let div12;
    	let input4;
    	let t21;
    	let div13;
    	let multiselectdropdown;
    	let updating_selected;
    	let t22;
    	let div17;
    	let button0;
    	let t24;
    	let button1;
    	let t26;
    	let button2;
    	let t28;
    	let footer;
    	let div18_class_value;
    	let current;
    	let mounted;
    	let dispose;
    	menu = new Menu({});

    	function multiselectdropdown_selected_binding(value) {
    		/*multiselectdropdown_selected_binding*/ ctx[13](value);
    	}

    	let multiselectdropdown_props = { categories: /*categories*/ ctx[3] };

    	if (/*$previewStore*/ ctx[1].categories !== void 0) {
    		multiselectdropdown_props.selected = /*$previewStore*/ ctx[1].categories;
    	}

    	multiselectdropdown = new MultiSelectDropdown({ props: multiselectdropdown_props });
    	binding_callbacks.push(() => bind(multiselectdropdown, 'selected', multiselectdropdown_selected_binding));
    	footer = new FooterBS({});

    	return {
    		c() {
    			div21 = element("div");
    			main = element("main");
    			div20 = element("div");
    			create_component(menu.$$.fragment);
    			t0 = space();
    			div19 = element("div");
    			section0 = element("section");

    			section0.innerHTML = `<div class="absolute top-0 w-full h-full bg-center bg-cover" style="background-image: url(../../img/Banner1u.png); "><span id="blackOverlay" class="w-full h-full absolute opacity-50 bg-black"></span> 

                        <div class="absolute left-0 right-0 top-1/2 transform -translate-y-1/2 px-4 flex flex-col items-start justify-center h-full"><div class="flex flex-col items-start" style="margin-top: 10rem;"><h1 class="text-8xl font-bold text-white mr-4 mb-0; margin-left: -3.5rem">BitSpark</h1> 
                                <h2 class="text-4xl font-light text-white mt-0" style="line-height: 0.9;"><span class="ml-2">Spark Idea</span></h2></div> 
                            <div class="absolute top-4 right-4 flex justify-end"><div class="text-4xl font-light text-white"><p class="text-5xl leading-tight" style="opacity: 0.3; margin-bottom: -0.4rem;">ignite ideas.</p> 
                                    <p class="text-5xl leading-tight" style="opacity: 1; margin-left: -2.8rem;">ignite <span class="text-orange-500">change</span>.</p></div></div></div> 
                        
                        <div class="top-auto bottom-0 left-0 right-0 w-full absolute pointer-events-none overflow-hidden h-70-px" style="transform: translateZ(0);"><svg class="absolute bottom-0 overflow-hidden" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" version="1.1" viewBox="0 0 2560 100" x="0" y="0"><polygon class="text-blueGray-200 fill-current" points="2560 0 2560 100 0 100"></polygon></svg></div></div>`;

    			t12 = space();
    			div18 = element("div");
    			section1 = element("section");
    			div16 = element("div");
    			div15 = element("div");
    			h21 = element("h2");
    			h21.textContent = "Spark Idea";
    			t14 = space();
    			div14 = element("div");
    			div6 = element("div");
    			input0 = element("input");
    			t15 = space();
    			div7 = element("div");
    			input1 = element("input");
    			t16 = space();
    			div8 = element("div");
    			textarea0 = element("textarea");
    			t17 = space();
    			div9 = element("div");
    			textarea1 = element("textarea");
    			t18 = space();
    			div10 = element("div");
    			input2 = element("input");
    			t19 = space();
    			div11 = element("div");
    			input3 = element("input");
    			t20 = space();
    			div12 = element("div");
    			input4 = element("input");
    			t21 = space();
    			div13 = element("div");
    			create_component(multiselectdropdown.$$.fragment);
    			t22 = space();
    			div17 = element("div");
    			button0 = element("button");
    			button0.textContent = "Back to Home";
    			t24 = space();
    			button1 = element("button");
    			button1.textContent = "Preview";
    			t26 = space();
    			button2 = element("button");
    			button2.textContent = "Spark Idea";
    			t28 = space();
    			create_component(footer.$$.fragment);
    			attr(section0, "class", "relative block h-500-px");
    			attr(h21, "class", "text-2xl font-semibold mb-4");
    			attr(input0, "type", "text");
    			attr(input0, "placeholder", "Idea Name");
    			attr(input0, "class", "flex justify-center block rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50");
    			set_style(input0, "width", "90%");
    			attr(div6, "class", "mb-4");
    			attr(input1, "type", "text");
    			attr(input1, "placeholder", "Idea Subtitle");
    			attr(input1, "class", "flex justify-center block rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50");
    			set_style(input1, "width", "90%");
    			attr(div7, "class", "mb-4");
    			attr(textarea0, "rows", "1");
    			attr(textarea0, "placeholder", "Abstract");
    			attr(textarea0, "class", "flex justify-center block rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 resize-none overflow-hidden");
    			set_style(textarea0, "width", "90%");
    			attr(div8, "class", "mb-4");
    			attr(textarea1, "rows", "1");
    			attr(textarea1, "placeholder", "Description");
    			attr(textarea1, "class", "flex justify-center block rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 resize-none overflow-hidden");
    			set_style(textarea1, "width", "90%");
    			attr(div9, "class", "mb-4");
    			attr(input2, "type", "text");
    			attr(input2, "placeholder", "Banner URL");
    			attr(input2, "class", "flex justify-center block rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50");
    			set_style(input2, "width", "90%");
    			attr(div10, "class", "mb-4");
    			attr(input3, "type", "text");
    			attr(input3, "placeholder", "GitHub Repository");
    			attr(input3, "class", "flex justify-center block rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50");
    			set_style(input3, "width", "90%");
    			attr(div11, "class", "mb-4");
    			attr(input4, "type", "text");
    			attr(input4, "placeholder", "Lightning Address");
    			attr(input4, "class", "flex justify-center block rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50");
    			set_style(input4, "width", "90%");
    			attr(div13, "class", "mb-4 mt-4");
    			set_style(div13, "width", "90%");
    			attr(div15, "class", "w-full md:w-3/4 lg:w-2/3 xl:w-1/2 mx-auto bg-white p-8 rounded-xl shadow-lg");
    			set_style(div15, "width", "100%");
    			attr(div16, "class", "container mx-auto px-4");
    			attr(button0, "class", "bg-red-500 text-white font-bold py-2 px-4 block rounded border border-red-500 mt-2 hover:shadow-xl");
    			attr(button1, "class", "bg-blue-500 text-white font-bold py-2 px-4 block rounded border border-blue-500 ml-4 mt-2 hover:shadow-xl");
    			attr(button2, "class", "bg-green-500 text-white font-bold py-2 px-4 block rounded border-transparent ml-4 mt-2 hover:shadow-xl");
    			attr(div17, "class", "container mx-auto px-4 flex justify-end");
    			attr(section1, "class", "content-container relative py-16 bg-blueGray-200 svelte-11wt8pz");
    			attr(div18, "class", div18_class_value = "" + (null_to_empty(/*contentContainerClass*/ ctx[0]) + " svelte-11wt8pz"));
    			attr(div19, "class", "flex-grow svelte-11wt8pz");
    			attr(div20, "class", "flex");
    			attr(main, "class", "overview-page bg-blueGray-200");
    			set_style(div21, "position", "relative");
    		},
    		m(target, anchor) {
    			insert(target, div21, anchor);
    			append(div21, main);
    			append(main, div20);
    			mount_component(menu, div20, null);
    			append(div20, t0);
    			append(div20, div19);
    			append(div19, section0);
    			append(div19, t12);
    			append(div19, div18);
    			append(div18, section1);
    			append(section1, div16);
    			append(div16, div15);
    			append(div15, h21);
    			append(div15, t14);
    			append(div15, div14);
    			append(div14, div6);
    			append(div6, input0);
    			set_input_value(input0, /*$previewStore*/ ctx[1].name);
    			append(div14, t15);
    			append(div14, div7);
    			append(div7, input1);
    			set_input_value(input1, /*$previewStore*/ ctx[1].subtitle);
    			append(div14, t16);
    			append(div14, div8);
    			append(div8, textarea0);
    			set_input_value(textarea0, /*$previewStore*/ ctx[1].abstract);
    			append(div14, t17);
    			append(div14, div9);
    			append(div9, textarea1);
    			set_input_value(textarea1, /*$previewStore*/ ctx[1].message);
    			append(div14, t18);
    			append(div14, div10);
    			append(div10, input2);
    			set_input_value(input2, /*$previewStore*/ ctx[1].bannerUrl);
    			append(div14, t19);
    			append(div14, div11);
    			append(div11, input3);
    			set_input_value(input3, /*$previewStore*/ ctx[1].githubRepo);
    			append(div14, t20);
    			append(div14, div12);
    			append(div12, input4);
    			set_input_value(input4, /*$previewStore*/ ctx[1].lightningAddress);
    			append(div14, t21);
    			append(div14, div13);
    			mount_component(multiselectdropdown, div13, null);
    			append(section1, t22);
    			append(section1, div17);
    			append(div17, button0);
    			append(div17, t24);
    			append(div17, button1);
    			append(div17, t26);
    			append(div17, button2);
    			append(div18, t28);
    			mount_component(footer, div18, null);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen(input0, "input", /*input0_input_handler*/ ctx[6]),
    					listen(input1, "input", /*input1_input_handler*/ ctx[7]),
    					listen(textarea0, "input", /*textarea0_input_handler*/ ctx[8]),
    					listen(textarea0, "input", autoResizeTextarea$1),
    					listen(textarea1, "input", /*textarea1_input_handler*/ ctx[9]),
    					listen(textarea1, "input", autoResizeTextarea$1),
    					listen(input2, "input", /*input2_input_handler*/ ctx[10]),
    					listen(input3, "input", /*input3_input_handler*/ ctx[11]),
    					listen(input4, "input", /*input4_input_handler*/ ctx[12]),
    					listen(button0, "click", /*click_handler*/ ctx[14]),
    					listen(button1, "click", /*click_handler_1*/ ctx[15]),
    					listen(button2, "click", /*postIdea*/ ctx[4])
    				];

    				mounted = true;
    			}
    		},
    		p(ctx, [dirty]) {
    			if (dirty & /*$previewStore*/ 2 && input0.value !== /*$previewStore*/ ctx[1].name) {
    				set_input_value(input0, /*$previewStore*/ ctx[1].name);
    			}

    			if (dirty & /*$previewStore*/ 2 && input1.value !== /*$previewStore*/ ctx[1].subtitle) {
    				set_input_value(input1, /*$previewStore*/ ctx[1].subtitle);
    			}

    			if (dirty & /*$previewStore*/ 2) {
    				set_input_value(textarea0, /*$previewStore*/ ctx[1].abstract);
    			}

    			if (dirty & /*$previewStore*/ 2) {
    				set_input_value(textarea1, /*$previewStore*/ ctx[1].message);
    			}

    			if (dirty & /*$previewStore*/ 2 && input2.value !== /*$previewStore*/ ctx[1].bannerUrl) {
    				set_input_value(input2, /*$previewStore*/ ctx[1].bannerUrl);
    			}

    			if (dirty & /*$previewStore*/ 2 && input3.value !== /*$previewStore*/ ctx[1].githubRepo) {
    				set_input_value(input3, /*$previewStore*/ ctx[1].githubRepo);
    			}

    			if (dirty & /*$previewStore*/ 2 && input4.value !== /*$previewStore*/ ctx[1].lightningAddress) {
    				set_input_value(input4, /*$previewStore*/ ctx[1].lightningAddress);
    			}

    			const multiselectdropdown_changes = {};

    			if (!updating_selected && dirty & /*$previewStore*/ 2) {
    				updating_selected = true;
    				multiselectdropdown_changes.selected = /*$previewStore*/ ctx[1].categories;
    				add_flush_callback(() => updating_selected = false);
    			}

    			multiselectdropdown.$set(multiselectdropdown_changes);

    			if (!current || dirty & /*contentContainerClass*/ 1 && div18_class_value !== (div18_class_value = "" + (null_to_empty(/*contentContainerClass*/ ctx[0]) + " svelte-11wt8pz"))) {
    				attr(div18, "class", div18_class_value);
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(menu.$$.fragment, local);
    			transition_in(multiselectdropdown.$$.fragment, local);
    			transition_in(footer.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(menu.$$.fragment, local);
    			transition_out(multiselectdropdown.$$.fragment, local);
    			transition_out(footer.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(div21);
    			destroy_component(menu);
    			destroy_component(multiselectdropdown);
    			destroy_component(footer);
    			mounted = false;
    			run_all(dispose);
    		}
    	};
    }

    function autoResizeTextarea$1(e) {
    	e.target.style.height = "";
    	e.target.style.height = e.target.scrollHeight + "px";
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let $sidebarOpen;
    	let $previewStore;
    	let $helperStore;
    	component_subscribe($$self, sidebarOpen, $$value => $$invalidate(5, $sidebarOpen = $$value));
    	component_subscribe($$self, previewStore, $$value => $$invalidate(1, $previewStore = $$value));
    	component_subscribe($$self, helperStore, $$value => $$invalidate(17, $helperStore = $$value));

    	function navigateTo(route) {
    		navigate(route);
    	}

    	onMount(async () => {
    		
    	});

    	let categories = [
    		"Art & Design",
    		"Bitcoin & P2P",
    		"Comics & Graphic Novels",
    		"Crafts & DIY",
    		"Fashion & Beauty",
    		"Film, Video & Animation",
    		"Food & Beverages",
    		"Games & Gaming",
    		"Health & Fitness",
    		"Journalism & News",
    		"Music & Audio",
    		"Photography & Visual Arts",
    		"Publishing & Writing",
    		"Technology & Software",
    		"Education & Learning",
    		"Environment & Sustainability",
    		"Sports & Outdoors",
    		"Travel & Tourism",
    		"Non-Profit & Social Causes",
    		"Business & Entrepreneurship",
    		"Science & Research",
    		"Home & Lifestyle",
    		"Automotive & Transportation",
    		"Pets & Animals",
    		"Parenting & Family"
    	];

    	async function postIdea() {
    		if ($previewStore.name && $previewStore.subtitle && $previewStore.abstract && $previewStore.message && $previewStore.bannerUrl && $previewStore.githubRepo && $previewStore.lightningAddress && $previewStore.categories) {
    			await $helperStore.postIdea($previewStore.name, $previewStore.subtitle, $previewStore.abstract, $previewStore.message, $previewStore.bannerUrl, $previewStore.githubRepo, $previewStore.lightningAddress, $previewStore.categories);
    			set_store_value(previewStore, $previewStore.name = "", $previewStore);
    			set_store_value(previewStore, $previewStore.subtitle = "", $previewStore);
    			set_store_value(previewStore, $previewStore.abstract = "", $previewStore);
    			set_store_value(previewStore, $previewStore.message = "", $previewStore);
    			set_store_value(previewStore, $previewStore.bannerUrl = "", $previewStore);
    			set_store_value(previewStore, $previewStore.githubRepo = "", $previewStore);
    			set_store_value(previewStore, $previewStore.lightningAddress = "", $previewStore);
    			set_store_value(previewStore, $previewStore.categories = [], $previewStore);
    			navigate("/overview");
    		} else {
    			console.log("Please fill all fields.");
    		}
    	}

    	let contentContainerClass = "content-container";

    	function input0_input_handler() {
    		$previewStore.name = this.value;
    		previewStore.set($previewStore);
    	}

    	function input1_input_handler() {
    		$previewStore.subtitle = this.value;
    		previewStore.set($previewStore);
    	}

    	function textarea0_input_handler() {
    		$previewStore.abstract = this.value;
    		previewStore.set($previewStore);
    	}

    	function textarea1_input_handler() {
    		$previewStore.message = this.value;
    		previewStore.set($previewStore);
    	}

    	function input2_input_handler() {
    		$previewStore.bannerUrl = this.value;
    		previewStore.set($previewStore);
    	}

    	function input3_input_handler() {
    		$previewStore.githubRepo = this.value;
    		previewStore.set($previewStore);
    	}

    	function input4_input_handler() {
    		$previewStore.lightningAddress = this.value;
    		previewStore.set($previewStore);
    	}

    	function multiselectdropdown_selected_binding(value) {
    		if ($$self.$$.not_equal($previewStore.categories, value)) {
    			$previewStore.categories = value;
    			previewStore.set($previewStore);
    		}
    	}

    	const click_handler = () => navigateTo("/overview");
    	const click_handler_1 = () => navigateTo("/preview");

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$sidebarOpen*/ 32) {
    			{
    				if ($sidebarOpen) {
    					$$invalidate(0, contentContainerClass = "content-container sidebar-open");
    				} else {
    					$$invalidate(0, contentContainerClass = "content-container");
    				}
    			}
    		}
    	};

    	return [
    		contentContainerClass,
    		$previewStore,
    		navigateTo,
    		categories,
    		postIdea,
    		$sidebarOpen,
    		input0_input_handler,
    		input1_input_handler,
    		textarea0_input_handler,
    		textarea1_input_handler,
    		input2_input_handler,
    		input3_input_handler,
    		input4_input_handler,
    		multiselectdropdown_selected_binding,
    		click_handler,
    		click_handler_1
    	];
    }

    class PostIdea extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$4, create_fragment$5, safe_not_equal, {});
    	}
    }

    var css_248z$2 = ".content-section.svelte-11wt8pz{display:flex;background-color:#e2e8f0 !important}.content-container.svelte-11wt8pz{flex-grow:1;z-index:0}.title-class.svelte-11wt8pz{position:absolute;left:0;right:0;top:1/2;transition:left 0.3s ease-in-out;left:30px}.title-class.sidebar-open.svelte-11wt8pz{left:215px}.flex-grow.svelte-11wt8pz{z-index:0}.content-container.svelte-11wt8pz{margin-left:0;transition:margin-left 0.3s ease-in-out;flex-grow:1;z-index:0}.content-container.sidebar-open.svelte-11wt8pz{margin-left:200px}";
    styleInject(css_248z$2);

    /* src/views/EditProfileView.svelte generated by Svelte v3.59.1 */

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[27] = list[i];
    	return child_ctx;
    }

    // (184:48) {#if profile && profile.picture}
    function create_if_block$3(ctx) {
    	let profileimg;
    	let current;

    	profileimg = new ProfileImg({
    			props: {
    				profile: /*profile*/ ctx[0],
    				style: {
    					position: "absolute",
    					width: "100%",
    					height: "100%",
    					objectFit: "cover",
    					top: "0",
    					left: "0"
    				}
    			}
    		});

    	return {
    		c() {
    			create_component(profileimg.$$.fragment);
    		},
    		m(target, anchor) {
    			mount_component(profileimg, target, anchor);
    			current = true;
    		},
    		p(ctx, dirty) {
    			const profileimg_changes = {};
    			if (dirty & /*profile*/ 1) profileimg_changes.profile = /*profile*/ ctx[0];
    			profileimg.$set(profileimg_changes);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(profileimg.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(profileimg.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			destroy_component(profileimg, detaching);
    		}
    	};
    }

    // (318:68) {#each relays as relay}
    function create_each_block$2(ctx) {
    	let div1;
    	let div0;
    	let t0_value = /*relay*/ ctx[27] + "";
    	let t0;
    	let t1;
    	let button;
    	let mounted;
    	let dispose;

    	function click_handler() {
    		return /*click_handler*/ ctx[22](/*relay*/ ctx[27]);
    	}

    	return {
    		c() {
    			div1 = element("div");
    			div0 = element("div");
    			t0 = text(t0_value);
    			t1 = space();
    			button = element("button");
    			button.textContent = "X";
    			attr(button, "class", "bg-red-500 w-5 h-5 rounded-full flex justify-center items-center");
    			attr(div1, "class", "flex justify-between px-3 py-1 rounded-full bg-white-800 text-sm text-black shadow-md");
    		},
    		m(target, anchor) {
    			insert(target, div1, anchor);
    			append(div1, div0);
    			append(div0, t0);
    			append(div1, t1);
    			append(div1, button);

    			if (!mounted) {
    				dispose = listen(button, "click", click_handler);
    				mounted = true;
    			}
    		},
    		p(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*relays*/ 128 && t0_value !== (t0_value = /*relay*/ ctx[27] + "")) set_data(t0, t0_value);
    		},
    		d(detaching) {
    			if (detaching) detach(div1);
    			mounted = false;
    			dispose();
    		}
    	};
    }

    function create_fragment$4(ctx) {
    	let div32;
    	let main;
    	let div31;
    	let menu;
    	let t0;
    	let div30;
    	let section0;
    	let div2;
    	let span;
    	let t1;
    	let div1;
    	let div0;
    	let h1;
    	let t2;
    	let div0_class_value;
    	let div2_style_value;
    	let t3;
    	let div3;
    	let t4;
    	let div29;
    	let section1;
    	let div28;
    	let div26;
    	let div25;
    	let div6;
    	let div5;
    	let div4;
    	let t5;
    	let div24;
    	let div11;
    	let div10;
    	let label0;
    	let t7;
    	let input0;
    	let t8;
    	let label1;
    	let t10;
    	let textarea;
    	let t11;
    	let div9;
    	let div7;
    	let label2;
    	let t13;
    	let input1;
    	let t14;
    	let div8;
    	let label3;
    	let t16;
    	let input2;
    	let t17;
    	let div23;
    	let div22;
    	let div15;
    	let div14;
    	let div12;
    	let label4;
    	let t19;
    	let input3;
    	let t20;
    	let div13;
    	let label5;
    	let t22;
    	let input4;
    	let t23;
    	let div21;
    	let div20;
    	let div19;
    	let div18;
    	let h2;
    	let t25;
    	let div17;
    	let t26;
    	let div16;
    	let input5;
    	let t27;
    	let button0;
    	let t29;
    	let div27;
    	let button1;
    	let t31;
    	let button2;
    	let t33;
    	let footer;
    	let div29_class_value;
    	let current;
    	let mounted;
    	let dispose;
    	menu = new Menu({});
    	let if_block = /*profile*/ ctx[0] && /*profile*/ ctx[0].picture && create_if_block$3(ctx);
    	let each_value = /*relays*/ ctx[7];
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	footer = new FooterBS({});

    	return {
    		c() {
    			div32 = element("div");
    			main = element("main");
    			div31 = element("div");
    			create_component(menu.$$.fragment);
    			t0 = space();
    			div30 = element("div");
    			section0 = element("section");
    			div2 = element("div");
    			span = element("span");
    			t1 = space();
    			div1 = element("div");
    			div0 = element("div");
    			h1 = element("h1");
    			t2 = text(/*name*/ ctx[1]);
    			t3 = space();
    			div3 = element("div");
    			div3.innerHTML = `<svg class="absolute bottom-0 overflow-hidden" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" version="1.1" viewBox="0 0 2560 100" x="0" y="0"><polygon class="text-blueGray-200 fill-current" points="2560 0 2560 100 0 100"></polygon></svg>`;
    			t4 = space();
    			div29 = element("div");
    			section1 = element("section");
    			div28 = element("div");
    			div26 = element("div");
    			div25 = element("div");
    			div6 = element("div");
    			div5 = element("div");
    			div4 = element("div");
    			if (if_block) if_block.c();
    			t5 = space();
    			div24 = element("div");
    			div11 = element("div");
    			div10 = element("div");
    			label0 = element("label");
    			label0.textContent = "Name";
    			t7 = space();
    			input0 = element("input");
    			t8 = space();
    			label1 = element("label");
    			label1.textContent = "About";
    			t10 = space();
    			textarea = element("textarea");
    			t11 = space();
    			div9 = element("div");
    			div7 = element("div");
    			label2 = element("label");
    			label2.textContent = "Github Username";
    			t13 = space();
    			input1 = element("input");
    			t14 = space();
    			div8 = element("div");
    			label3 = element("label");
    			label3.textContent = "Github Proof";
    			t16 = space();
    			input2 = element("input");
    			t17 = space();
    			div23 = element("div");
    			div22 = element("div");
    			div15 = element("div");
    			div14 = element("div");
    			div12 = element("div");
    			label4 = element("label");
    			label4.textContent = "Profile Picture\n                                                                URL";
    			t19 = space();
    			input3 = element("input");
    			t20 = space();
    			div13 = element("div");
    			label5 = element("label");
    			label5.textContent = "Banner URL";
    			t22 = space();
    			input4 = element("input");
    			t23 = space();
    			div21 = element("div");
    			div20 = element("div");
    			div19 = element("div");
    			div18 = element("div");
    			h2 = element("h2");
    			h2.textContent = "Relays";
    			t25 = space();
    			div17 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t26 = space();
    			div16 = element("div");
    			input5 = element("input");
    			t27 = space();
    			button0 = element("button");
    			button0.textContent = "Add";
    			t29 = space();
    			div27 = element("div");
    			button1 = element("button");
    			button1.textContent = "Back";
    			t31 = space();
    			button2 = element("button");
    			button2.textContent = "Update Profile";
    			t33 = space();
    			create_component(footer.$$.fragment);
    			attr(span, "id", "blackOverlay");
    			attr(span, "class", "w-full h-full absolute opacity-50 bg-black");
    			attr(h1, "class", "text-4xl font-bold text-white");
    			attr(div0, "class", div0_class_value = "" + (null_to_empty(/*titleClass*/ ctx[10]) + " svelte-11wt8pz"));
    			attr(div1, "class", "absolute left-0 right-0 top-1/2 transform -translate-y-1/2 px-4 flex flex-col items-start justify-center h-full");
    			attr(div2, "class", "absolute top-0 w-full h-full bg-center bg-cover");
    			attr(div2, "style", div2_style_value = `background-image: url(${/*banner*/ ctx[4]});`);
    			attr(div3, "class", "top-auto bottom-0 left-0 right-0 w-full absolute pointer-events-none overflow-hidden h-70-px");
    			set_style(div3, "transform", "translateZ(0)");
    			attr(section0, "class", "relative block h-500-px");
    			set_style(div4, "width", "150px");
    			set_style(div4, "height", "150px");
    			set_style(div4, "border-radius", "50%");
    			set_style(div4, "overflow", "hidden");
    			set_style(div4, "position", "relative");
    			set_style(div4, "top", "-75px");
    			attr(div5, "class", "w-full lg:w-3/12 px-4 lg:order-2 flex justify-center");
    			attr(div6, "class", "flex flex-wrap justify-center");
    			attr(label0, "for", "name");
    			attr(label0, "class", "text-lg text-blueGray-400");
    			attr(input0, "id", "name");
    			attr(input0, "class", "shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-4");
    			attr(label1, "for", "about");
    			attr(label1, "class", "text-lg text-blueGray-400");
    			attr(textarea, "id", "about");
    			attr(textarea, "class", "shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-4");
    			attr(label2, "for", "git_username");
    			attr(label2, "class", "text-lg text-blueGray-400");
    			attr(input1, "id", "git_username");
    			attr(input1, "class", "shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-4");
    			attr(label3, "for", "git_proof");
    			attr(label3, "class", "text-lg text-blueGray-400");
    			attr(input2, "id", "git_proof");
    			attr(input2, "class", "shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-4");
    			attr(div9, "class", "flex space-x-4");
    			attr(div10, "class", "mb-2 text-blueGray-600 mt-10 w-full lg:w-9/12 px-4 mx-auto");
    			attr(div11, "class", "text-center mt-12");
    			attr(label4, "for", "picture");
    			attr(label4, "class", "text-lg text-blueGray-400");
    			attr(input3, "id", "picture");
    			attr(input3, "class", "shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-4");
    			attr(div12, "class", "mb-4");
    			attr(label5, "for", "banner");
    			attr(label5, "class", "text-lg text-blueGray-400");
    			attr(input4, "id", "banner");
    			attr(input4, "class", "shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-4");
    			attr(div14, "class", "mt-6");
    			attr(div15, "class", "w-full lg:w-9/12 px-4");
    			attr(h2, "class", "text-lg text-blueGray-400 mb-4");
    			attr(input5, "class", "shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline");
    			attr(input5, "placeholder", "Enter relay URL...");
    			attr(button0, "class", "bg-green-500 text-white font-bold py-2 px-4 rounded ml-2");
    			attr(div16, "class", "flex justify-between items-center mt-4");
    			attr(div17, "class", "flex flex-col gap-2");
    			attr(div18, "class", "mt-6");
    			attr(div19, "class", "w-full lg:w-9/12 px-4");
    			attr(div20, "class", "flex flex-wrap justify-center");
    			attr(div21, "class", "mt-10 py-10 border-t border-blueGray-200 text-center w-full");
    			attr(div22, "class", "flex flex-wrap justify-center");
    			attr(div23, "class", "mt-10 py-10 border-t border-blueGray-200 text-center");
    			attr(div24, "class", "mt-10 px-10");
    			attr(div25, "class", "px-6");
    			attr(div26, "class", "relative flex flex-col min-w-0 break-words bg-white w-full mb-6 shadow-xl rounded-lg -mt-64");
    			attr(button1, "class", "bg-red-500 text-white font-bold py-2 px-4 rounded mr-4");
    			attr(button2, "class", "bg-green-500 text-white font-bold py-2 px-4 rounded");
    			attr(div27, "class", "flex justify-end mt-4 px-10");
    			attr(div28, "class", "container mx-auto px-4");
    			attr(section1, "class", "relative py-16 bg-blueGray-200");
    			attr(div29, "class", div29_class_value = "" + (null_to_empty(/*contentContainerClass*/ ctx[9]) + " svelte-11wt8pz"));
    			attr(div30, "class", "flex-grow svelte-11wt8pz");
    			attr(div31, "class", "flex");
    			attr(main, "class", "profile-page bg-blueGray-200");
    			set_style(div32, "position", "relative");
    		},
    		m(target, anchor) {
    			insert(target, div32, anchor);
    			append(div32, main);
    			append(main, div31);
    			mount_component(menu, div31, null);
    			append(div31, t0);
    			append(div31, div30);
    			append(div30, section0);
    			append(section0, div2);
    			append(div2, span);
    			append(div2, t1);
    			append(div2, div1);
    			append(div1, div0);
    			append(div0, h1);
    			append(h1, t2);
    			append(section0, t3);
    			append(section0, div3);
    			append(div30, t4);
    			append(div30, div29);
    			append(div29, section1);
    			append(section1, div28);
    			append(div28, div26);
    			append(div26, div25);
    			append(div25, div6);
    			append(div6, div5);
    			append(div5, div4);
    			if (if_block) if_block.m(div4, null);
    			append(div25, t5);
    			append(div25, div24);
    			append(div24, div11);
    			append(div11, div10);
    			append(div10, label0);
    			append(div10, t7);
    			append(div10, input0);
    			set_input_value(input0, /*name*/ ctx[1]);
    			append(div10, t8);
    			append(div10, label1);
    			append(div10, t10);
    			append(div10, textarea);
    			set_input_value(textarea, /*dev_about*/ ctx[2]);
    			append(div10, t11);
    			append(div10, div9);
    			append(div9, div7);
    			append(div7, label2);
    			append(div7, t13);
    			append(div7, input1);
    			set_input_value(input1, /*git_username*/ ctx[5]);
    			append(div9, t14);
    			append(div9, div8);
    			append(div8, label3);
    			append(div8, t16);
    			append(div8, input2);
    			set_input_value(input2, /*git_proof*/ ctx[6]);
    			append(div24, t17);
    			append(div24, div23);
    			append(div23, div22);
    			append(div22, div15);
    			append(div15, div14);
    			append(div14, div12);
    			append(div12, label4);
    			append(div12, t19);
    			append(div12, input3);
    			set_input_value(input3, /*picture*/ ctx[3]);
    			append(div14, t20);
    			append(div14, div13);
    			append(div13, label5);
    			append(div13, t22);
    			append(div13, input4);
    			set_input_value(input4, /*banner*/ ctx[4]);
    			append(div22, t23);
    			append(div22, div21);
    			append(div21, div20);
    			append(div20, div19);
    			append(div19, div18);
    			append(div18, h2);
    			append(div18, t25);
    			append(div18, div17);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				if (each_blocks[i]) {
    					each_blocks[i].m(div17, null);
    				}
    			}

    			append(div17, t26);
    			append(div17, div16);
    			append(div16, input5);
    			set_input_value(input5, /*newRelay*/ ctx[8]);
    			append(div16, t27);
    			append(div16, button0);
    			append(div28, t29);
    			append(div28, div27);
    			append(div27, button1);
    			append(div27, t31);
    			append(div27, button2);
    			append(div29, t33);
    			mount_component(footer, div29, null);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen(input0, "input", /*input0_input_handler*/ ctx[16]),
    					listen(textarea, "input", /*textarea_input_handler*/ ctx[17]),
    					listen(textarea, "input", autoResizeTextarea),
    					listen(input1, "input", /*input1_input_handler*/ ctx[18]),
    					listen(input2, "input", /*input2_input_handler*/ ctx[19]),
    					listen(input3, "input", /*input3_input_handler*/ ctx[20]),
    					listen(input4, "input", /*input4_input_handler*/ ctx[21]),
    					listen(input5, "input", /*input5_input_handler*/ ctx[23]),
    					listen(button0, "click", /*addRelay*/ ctx[13]),
    					listen(button1, "click", /*click_handler_1*/ ctx[24]),
    					listen(button2, "click", /*updateProfile*/ ctx[11])
    				];

    				mounted = true;
    			}
    		},
    		p(ctx, [dirty]) {
    			if (!current || dirty & /*name*/ 2) set_data(t2, /*name*/ ctx[1]);

    			if (!current || dirty & /*titleClass*/ 1024 && div0_class_value !== (div0_class_value = "" + (null_to_empty(/*titleClass*/ ctx[10]) + " svelte-11wt8pz"))) {
    				attr(div0, "class", div0_class_value);
    			}

    			if (!current || dirty & /*banner*/ 16 && div2_style_value !== (div2_style_value = `background-image: url(${/*banner*/ ctx[4]});`)) {
    				attr(div2, "style", div2_style_value);
    			}

    			if (/*profile*/ ctx[0] && /*profile*/ ctx[0].picture) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*profile*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$3(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(div4, null);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}

    			if (dirty & /*name*/ 2 && input0.value !== /*name*/ ctx[1]) {
    				set_input_value(input0, /*name*/ ctx[1]);
    			}

    			if (dirty & /*dev_about*/ 4) {
    				set_input_value(textarea, /*dev_about*/ ctx[2]);
    			}

    			if (dirty & /*git_username*/ 32 && input1.value !== /*git_username*/ ctx[5]) {
    				set_input_value(input1, /*git_username*/ ctx[5]);
    			}

    			if (dirty & /*git_proof*/ 64 && input2.value !== /*git_proof*/ ctx[6]) {
    				set_input_value(input2, /*git_proof*/ ctx[6]);
    			}

    			if (dirty & /*picture*/ 8 && input3.value !== /*picture*/ ctx[3]) {
    				set_input_value(input3, /*picture*/ ctx[3]);
    			}

    			if (dirty & /*banner*/ 16 && input4.value !== /*banner*/ ctx[4]) {
    				set_input_value(input4, /*banner*/ ctx[4]);
    			}

    			if (dirty & /*deleteRelay, relays*/ 4224) {
    				each_value = /*relays*/ ctx[7];
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div17, t26);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty & /*newRelay*/ 256 && input5.value !== /*newRelay*/ ctx[8]) {
    				set_input_value(input5, /*newRelay*/ ctx[8]);
    			}

    			if (!current || dirty & /*contentContainerClass*/ 512 && div29_class_value !== (div29_class_value = "" + (null_to_empty(/*contentContainerClass*/ ctx[9]) + " svelte-11wt8pz"))) {
    				attr(div29, "class", div29_class_value);
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(menu.$$.fragment, local);
    			transition_in(if_block);
    			transition_in(footer.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(menu.$$.fragment, local);
    			transition_out(if_block);
    			transition_out(footer.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(div32);
    			destroy_component(menu);
    			if (if_block) if_block.d();
    			destroy_each(each_blocks, detaching);
    			destroy_component(footer);
    			mounted = false;
    			run_all(dispose);
    		}
    	};
    }

    let bitstarterHelper = null;

    function autoResizeTextarea(e) {
    	e.target.style.height = "";
    	e.target.style.height = e.target.scrollHeight + "px";
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let $sidebarOpen;
    	let $helperStore;
    	component_subscribe($$self, sidebarOpen, $$value => $$invalidate(15, $sidebarOpen = $$value));
    	component_subscribe($$self, helperStore, $$value => $$invalidate(25, $helperStore = $$value));

    	let { profile_id } = $$props;
    	let profile = null;
    	let name = "";
    	let dev_about = "";
    	let picture = "";
    	let banner = "";
    	let git_username = "";
    	let git_proof = "";
    	let relays = [];
    	let newRelay = "";

    	onMount(async () => {
    		try {
    			$$invalidate(0, profile = await $helperStore.getProfile(profile_id));

    			if (profile) {
    				$$invalidate(1, name = profile.name);
    				$$invalidate(2, dev_about = profile.dev_about);
    				$$invalidate(3, picture = profile.picture);
    				$$invalidate(4, banner = profile.banner);

    				// Get GitHub username and proof from profile
    				$$invalidate(5, git_username = profile.githubUsername || "");

    				$$invalidate(6, git_proof = profile.githubProof || "");
    				$$invalidate(7, relays = await $helperStore.clientRelays);
    			}
    		} catch(error) {
    			console.error("Error fetching profile:", error);
    		}
    	});

    	const updateProfile = async () => {
    		try {
    			const updatedIdentities = profile && profile.identities
    			? [
    					...profile.identities.filter(identity => identity.platform !== "github"),
    					{
    						platform: "github",
    						identity: git_username,
    						proof: git_proof
    					}
    				]
    			: [
    					{
    						platform: "github",
    						identity: git_username,
    						proof: git_proof
    					}
    				];

    			await $helperStore.updateProfile(name, picture, banner, dev_about, profile.lnurl, updatedIdentities);
    			await navigate("/overview"); // navigate back to home page after saving
    		} catch(error) {
    			console.error("Error updating profile:", error);
    		}
    	};

    	const deleteRelay = async relay => {
    		try {
    			await bitstarterHelper.deleteRelay(relay);
    			$$invalidate(7, relays = relays.filter(r => r !== relay));
    		} catch(error) {
    			console.error("Error deleting relay:", error); // Remove relay from relays array
    		}
    	};

    	const addRelay = async () => {
    		try {
    			if (newRelay.trim()) {
    				await bitstarterHelper.addRelay(newRelay);

    				// Add the new relay to the local list
    				$$invalidate(7, relays = [...bitstarterHelper.clientRelays]);

    				$$invalidate(8, newRelay = "");
    			}
    		} catch(error) {
    			console.error("Error adding relay:", error);
    		}
    	};

    	let contentContainerClass = "content-container";
    	let titleClass = "title-class";

    	function input0_input_handler() {
    		name = this.value;
    		$$invalidate(1, name);
    	}

    	function textarea_input_handler() {
    		dev_about = this.value;
    		$$invalidate(2, dev_about);
    	}

    	function input1_input_handler() {
    		git_username = this.value;
    		$$invalidate(5, git_username);
    	}

    	function input2_input_handler() {
    		git_proof = this.value;
    		$$invalidate(6, git_proof);
    	}

    	function input3_input_handler() {
    		picture = this.value;
    		$$invalidate(3, picture);
    	}

    	function input4_input_handler() {
    		banner = this.value;
    		$$invalidate(4, banner);
    	}

    	const click_handler = relay => deleteRelay(relay);

    	function input5_input_handler() {
    		newRelay = this.value;
    		$$invalidate(8, newRelay);
    	}

    	const click_handler_1 = () => navigate(`/overview`);

    	$$self.$$set = $$props => {
    		if ('profile_id' in $$props) $$invalidate(14, profile_id = $$props.profile_id);
    	};

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$sidebarOpen*/ 32768) {
    			{
    				if ($sidebarOpen) {
    					$$invalidate(9, contentContainerClass = "content-container sidebar-open");
    					$$invalidate(10, titleClass = "title-class sidebar-open");
    				} else {
    					$$invalidate(9, contentContainerClass = "content-container");
    					$$invalidate(10, titleClass = "title-class");
    				}
    			}
    		}
    	};

    	return [
    		profile,
    		name,
    		dev_about,
    		picture,
    		banner,
    		git_username,
    		git_proof,
    		relays,
    		newRelay,
    		contentContainerClass,
    		titleClass,
    		updateProfile,
    		deleteRelay,
    		addRelay,
    		profile_id,
    		$sidebarOpen,
    		input0_input_handler,
    		textarea_input_handler,
    		input1_input_handler,
    		input2_input_handler,
    		input3_input_handler,
    		input4_input_handler,
    		click_handler,
    		input5_input_handler,
    		click_handler_1
    	];
    }

    class EditProfileView extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$3, create_fragment$4, safe_not_equal, { profile_id: 14 });
    	}
    }

    /* src/components/UserIdeas.svelte generated by Svelte v3.59.1 */

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[4] = list[i];
    	return child_ctx;
    }

    // (42:20) {#if profile}
    function create_if_block_1$2(ctx) {
    	let h1;
    	let t0_value = /*profile*/ ctx[1].name + "";
    	let t0;
    	let t1;

    	return {
    		c() {
    			h1 = element("h1");
    			t0 = text(t0_value);
    			t1 = text("'s Ideas");
    			attr(h1, "class", "relative flex text-4xl font-bold text-black ml-6 mb-6");
    		},
    		m(target, anchor) {
    			insert(target, h1, anchor);
    			append(h1, t0);
    			append(h1, t1);
    		},
    		p(ctx, dirty) {
    			if (dirty & /*profile*/ 2 && t0_value !== (t0_value = /*profile*/ ctx[1].name + "")) set_data(t0, t0_value);
    		},
    		d(detaching) {
    			if (detaching) detach(h1);
    		}
    	};
    }

    // (69:40) {#if idea.subtitle}
    function create_if_block$2(ctx) {
    	let p;
    	let t_value = /*idea*/ ctx[4].subtitle + "";
    	let t;

    	return {
    		c() {
    			p = element("p");
    			t = text(t_value);
    			attr(p, "class", "text-md font-light mt-2 text-blueGray-600");
    		},
    		m(target, anchor) {
    			insert(target, p, anchor);
    			append(p, t);
    		},
    		p(ctx, dirty) {
    			if (dirty & /*ideas*/ 1 && t_value !== (t_value = /*idea*/ ctx[4].subtitle + "")) set_data(t, t_value);
    		},
    		d(detaching) {
    			if (detaching) detach(p);
    		}
    	};
    }

    // (47:28) <Link                                 to={`/idea/${idea.id}`}                                 class="w-full md:w-6/12 lg:w-3/12 px-4 mb-6 no-underline"                             >
    function create_default_slot$2(ctx) {
    	let div1;
    	let div0;
    	let img;
    	let img_src_value;
    	let img_alt_value;
    	let t0;
    	let blockquote;
    	let h4;
    	let t1_value = /*idea*/ ctx[4].name + "";
    	let t1;
    	let t2;
    	let t3;
    	let if_block = /*idea*/ ctx[4].subtitle && create_if_block$2(ctx);

    	return {
    		c() {
    			div1 = element("div");
    			div0 = element("div");
    			img = element("img");
    			t0 = space();
    			blockquote = element("blockquote");
    			h4 = element("h4");
    			t1 = text(t1_value);
    			t2 = space();
    			if (if_block) if_block.c();
    			t3 = space();
    			attr(img, "class", "align-middle border-none max-w-full h-auto rounded-lg");
    			if (!src_url_equal(img.src, img_src_value = /*idea*/ ctx[4].bannerImage)) attr(img, "src", img_src_value);
    			attr(img, "alt", img_alt_value = /*idea*/ ctx[4].name);
    			attr(div0, "class", "relative flex flex-col min-w-0 w-full mb-0 shadow-lg rounded-lg bg-blueGray-600");
    			attr(h4, "class", "text-xl font-bold text-blueGray-700");
    			attr(blockquote, "class", "relative p-8 mb-4");
    			attr(div1, "class", "shadow-lg rounded-lg text-center relative min-w-0 break-words bg-white w-full mb-8 shadow-lg rounded-lg pointer-events-auto cursor-pointer lg:w-full");
    		},
    		m(target, anchor) {
    			insert(target, div1, anchor);
    			append(div1, div0);
    			append(div0, img);
    			append(div1, t0);
    			append(div1, blockquote);
    			append(blockquote, h4);
    			append(h4, t1);
    			append(blockquote, t2);
    			if (if_block) if_block.m(blockquote, null);
    			insert(target, t3, anchor);
    		},
    		p(ctx, dirty) {
    			if (dirty & /*ideas*/ 1 && !src_url_equal(img.src, img_src_value = /*idea*/ ctx[4].bannerImage)) {
    				attr(img, "src", img_src_value);
    			}

    			if (dirty & /*ideas*/ 1 && img_alt_value !== (img_alt_value = /*idea*/ ctx[4].name)) {
    				attr(img, "alt", img_alt_value);
    			}

    			if (dirty & /*ideas*/ 1 && t1_value !== (t1_value = /*idea*/ ctx[4].name + "")) set_data(t1, t1_value);

    			if (/*idea*/ ctx[4].subtitle) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$2(ctx);
    					if_block.c();
    					if_block.m(blockquote, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d(detaching) {
    			if (detaching) detach(div1);
    			if (if_block) if_block.d();
    			if (detaching) detach(t3);
    		}
    	};
    }

    // (46:24) {#each ideas as idea (idea.id)}
    function create_each_block$1(key_1, ctx) {
    	let first;
    	let link;
    	let current;

    	link = new Link({
    			props: {
    				to: `/idea/${/*idea*/ ctx[4].id}`,
    				class: "w-full md:w-6/12 lg:w-3/12 px-4 mb-6 no-underline",
    				$$slots: { default: [create_default_slot$2] },
    				$$scope: { ctx }
    			}
    		});

    	return {
    		key: key_1,
    		first: null,
    		c() {
    			first = empty();
    			create_component(link.$$.fragment);
    			this.first = first;
    		},
    		m(target, anchor) {
    			insert(target, first, anchor);
    			mount_component(link, target, anchor);
    			current = true;
    		},
    		p(new_ctx, dirty) {
    			ctx = new_ctx;
    			const link_changes = {};
    			if (dirty & /*ideas*/ 1) link_changes.to = `/idea/${/*idea*/ ctx[4].id}`;

    			if (dirty & /*$$scope, ideas*/ 129) {
    				link_changes.$$scope = { dirty, ctx };
    			}

    			link.$set(link_changes);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(link.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(link.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(first);
    			destroy_component(link, detaching);
    		}
    	};
    }

    function create_fragment$3(ctx) {
    	let div4;
    	let section;
    	let div3;
    	let div2;
    	let div1;
    	let t;
    	let div0;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let current;
    	let if_block = /*profile*/ ctx[1] && create_if_block_1$2(ctx);
    	let each_value = /*ideas*/ ctx[0];
    	const get_key = ctx => /*idea*/ ctx[4].id;

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$1(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block$1(key, child_ctx));
    	}

    	return {
    		c() {
    			div4 = element("div");
    			section = element("section");
    			div3 = element("div");
    			div2 = element("div");
    			div1 = element("div");
    			if (if_block) if_block.c();
    			t = space();
    			div0 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr(div0, "class", "flex flex-wrap justify-between");
    			attr(div1, "class", "px-6 py-6");
    			attr(div2, "class", "relative flex flex-col min-w-0 break-words bg-white w-full mb-6 shadow-xl rounded-lg mx-auto");
    			set_style(div2, "max-width", "100%");
    			attr(section, "class", "relative py-16 bg-blueGray-200");
    			set_style(div4, "width", "100%");
    		},
    		m(target, anchor) {
    			insert(target, div4, anchor);
    			append(div4, section);
    			append(section, div3);
    			append(div3, div2);
    			append(div2, div1);
    			if (if_block) if_block.m(div1, null);
    			append(div1, t);
    			append(div1, div0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				if (each_blocks[i]) {
    					each_blocks[i].m(div0, null);
    				}
    			}

    			current = true;
    		},
    		p(ctx, [dirty]) {
    			if (/*profile*/ ctx[1]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_1$2(ctx);
    					if_block.c();
    					if_block.m(div1, t);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (dirty & /*ideas*/ 1) {
    				each_value = /*ideas*/ ctx[0];
    				group_outros();
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, div0, outro_and_destroy_block, create_each_block$1, null, get_each_context$1);
    				check_outros();
    			}
    		},
    		i(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o(local) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(div4);
    			if (if_block) if_block.d();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}
    		}
    	};
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let $helperStore;
    	component_subscribe($$self, helperStore, $$value => $$invalidate(3, $helperStore = $$value));
    	let { profile_id } = $$props;
    	let ideas = [];
    	let profile = null;

    	onMount(async () => {
    		try {
    			$$invalidate(1, profile = await $helperStore.getProfile(profile_id));
    			const ideas_ = await $helperStore.getUserIdeas(profile_id);

    			$$invalidate(0, ideas = ideas_.map(idea => {
    				const tags = idea.tags.reduce((tagObj, [key, value]) => ({ ...tagObj, [key]: value }), {});

    				return {
    					id: idea.id,
    					name: tags.iName,
    					subtitle: tags.iSub,
    					bannerImage: tags.ibUrl,
    					message: idea.content,
    					abstract: tags.abstract
    				};
    			}));
    		} catch(error) {
    			console.error("Error fetching user ideas:", error);
    		}
    	});

    	$$self.$$set = $$props => {
    		if ('profile_id' in $$props) $$invalidate(2, profile_id = $$props.profile_id);
    	};

    	return [ideas, profile, profile_id];
    }

    class UserIdeas extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$2, create_fragment$3, safe_not_equal, { profile_id: 2 });
    	}
    }

    var css_248z$1 = ".content-section.svelte-11wt8pz{display:flex;background-color:#e2e8f0 !important}.content-container.svelte-11wt8pz{flex-grow:1;z-index:0}.title-class.svelte-11wt8pz{position:absolute;left:0;right:0;top:1/2;transition:left 0.3s ease-in-out;left:30px}.title-class.sidebar-open.svelte-11wt8pz{left:215px}.flex-grow.svelte-11wt8pz{z-index:0}.content-container.svelte-11wt8pz{margin-left:0;transition:margin-left 0.3s ease-in-out;flex-grow:1;z-index:0}.content-container.sidebar-open.svelte-11wt8pz{margin-left:200px}";
    styleInject(css_248z$1);

    /* src/views/ProfileView.svelte generated by Svelte v3.59.1 */

    function create_if_block_1$1(ctx) {
    	let button;
    	let mounted;
    	let dispose;

    	return {
    		c() {
    			button = element("button");
    			button.textContent = "Edit";
    			attr(button, "class", "bg-blue-500 text-white font-bold py-2 px-4 rounded absolute");
    			set_style(button, "top", "10px");
    			set_style(button, "right", "10px");
    			set_style(button, "z-index", "1");
    		},
    		m(target, anchor) {
    			insert(target, button, anchor);

    			if (!mounted) {
    				dispose = listen(button, "click", /*click_handler*/ ctx[11]);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d(detaching) {
    			if (detaching) detach(button);
    			mounted = false;
    			dispose();
    		}
    	};
    }

    // (160:56) {#if profile && profile.picture}
    function create_if_block$1(ctx) {
    	let profileimg;
    	let current;

    	profileimg = new ProfileImg({
    			props: {
    				profile: /*profile*/ ctx[1],
    				style: {
    					position: "absolute",
    					width: "100%",
    					height: "100%",
    					objectFit: "cover",
    					top: "0",
    					left: "0"
    				}
    			}
    		});

    	return {
    		c() {
    			create_component(profileimg.$$.fragment);
    		},
    		m(target, anchor) {
    			mount_component(profileimg, target, anchor);
    			current = true;
    		},
    		p(ctx, dirty) {
    			const profileimg_changes = {};
    			if (dirty & /*profile*/ 2) profileimg_changes.profile = /*profile*/ ctx[1];
    			profileimg.$set(profileimg_changes);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(profileimg.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(profileimg.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			destroy_component(profileimg, detaching);
    		}
    	};
    }

    function create_fragment$2(ctx) {
    	let div23;
    	let main;
    	let div22;
    	let menu;
    	let t0;
    	let div21;
    	let section0;
    	let div3;
    	let span;
    	let t1;
    	let div1;
    	let div0;
    	let t2;
    	let div0_class_value;
    	let t3;
    	let div2;
    	let button0;
    	let t4;
    	let a;
    	let i;
    	let a_href_value;
    	let div3_style_value;
    	let t5;
    	let div4;
    	let t6;
    	let div20;
    	let section1;
    	let div19;
    	let div18;
    	let div17;
    	let div13;
    	let t7;
    	let div12;
    	let div7;
    	let div6;
    	let div5;
    	let t8;
    	let div11;
    	let div10;
    	let div9;
    	let div8;
    	let t9;
    	let div15;
    	let div14;
    	let userideas;
    	let t10;
    	let div16;
    	let button1;
    	let t12;
    	let footer;
    	let div20_class_value;
    	let current;
    	let mounted;
    	let dispose;
    	menu = new Menu({});
    	let if_block0 = /*profile_id*/ ctx[0] === /*publicKey*/ ctx[6] && create_if_block_1$1(ctx);
    	let if_block1 = /*profile*/ ctx[1] && /*profile*/ ctx[1].picture && create_if_block$1(ctx);

    	userideas = new UserIdeas({
    			props: { profile_id: /*profile_id*/ ctx[0] }
    		});

    	footer = new FooterBS({});

    	return {
    		c() {
    			div23 = element("div");
    			main = element("main");
    			div22 = element("div");
    			create_component(menu.$$.fragment);
    			t0 = space();
    			div21 = element("div");
    			section0 = element("section");
    			div3 = element("div");
    			span = element("span");
    			t1 = space();
    			div1 = element("div");
    			div0 = element("div");
    			t2 = text(/*name*/ ctx[2]);
    			t3 = space();
    			div2 = element("div");
    			button0 = element("button");
    			button0.innerHTML = `<img src="/img/lightning.png" style="height: 2.5rem; width: 2.5rem;" alt="Support via Bitcoin Lightning"/>`;
    			t4 = space();
    			a = element("a");
    			i = element("i");
    			t5 = space();
    			div4 = element("div");
    			div4.innerHTML = `<svg class="absolute bottom-0 overflow-hidden" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" version="1.1" viewBox="0 0 2560 100" x="0" y="0"><polygon class="text-blueGray-200 fill-current" points="2560 0 2560 100 0 100"></polygon></svg>`;
    			t6 = space();
    			div20 = element("div");
    			section1 = element("section");
    			div19 = element("div");
    			div18 = element("div");
    			div17 = element("div");
    			div13 = element("div");
    			if (if_block0) if_block0.c();
    			t7 = space();
    			div12 = element("div");
    			div7 = element("div");
    			div6 = element("div");
    			div5 = element("div");
    			if (if_block1) if_block1.c();
    			t8 = space();
    			div11 = element("div");
    			div10 = element("div");
    			div9 = element("div");
    			div8 = element("div");
    			t9 = space();
    			div15 = element("div");
    			div14 = element("div");
    			create_component(userideas.$$.fragment);
    			t10 = space();
    			div16 = element("div");
    			button1 = element("button");
    			button1.textContent = "Back";
    			t12 = space();
    			create_component(footer.$$.fragment);
    			attr(span, "id", "blackOverlay");
    			attr(span, "class", "w-full h-full absolute opacity-50 bg-black");
    			attr(div0, "class", div0_class_value = "" + (null_to_empty(/*titleClass*/ ctx[8]) + " svelte-11wt8pz"));
    			attr(div1, "class", "absolute left-0 top-1/2 transform -translate-y-1/2 text-white text-4xl font-bold p-5");
    			set_style(button0, "padding", "0");
    			attr(i, "class", "fab fa-github text-white");
    			set_style(i, "font-size", "2.5rem");
    			attr(a, "href", a_href_value = "https://www.github.com/" + /*ghUser*/ ctx[5]);
    			attr(a, "target", "_blank");
    			attr(div2, "class", "absolute top-4 right-4 text-3xl text-white flex justify-end items-center gap-6");
    			attr(div3, "class", "absolute top-0 w-full h-full bg-center bg-cover");
    			attr(div3, "style", div3_style_value = `background-image: url(${/*banner*/ ctx[4]});`);
    			attr(div4, "class", "top-auto bottom-0 left-0 right-0 w-full absolute pointer-events-none overflow-hidden h-70-px");
    			set_style(div4, "transform", "translateZ(0)");
    			attr(section0, "class", "relative block h-500-px");
    			set_style(div5, "width", "150px");
    			set_style(div5, "height", "150px");
    			set_style(div5, "border-radius", "50%");
    			set_style(div5, "overflow", "hidden");
    			set_style(div5, "position", "relative");
    			set_style(div5, "top", "-75px");
    			attr(div6, "class", "w-full lg:w-3/12 px-4 lg:order-2 flex justify-center");
    			attr(div7, "class", "flex flex-wrap justify-center");
    			attr(div8, "class", "text-lg leading-relaxed mt-4 mb-20 text-blueGray-700 whitespace-pre-line");
    			attr(div9, "class", "w-full lg:w-9/12 px-4");
    			attr(div10, "class", "flex flex-wrap justify-center");
    			attr(div11, "class", "mt-10 py-10 border-t border-blueGray-200 text-center");
    			attr(div12, "class", "px-6");
    			attr(div13, "class", "relative flex flex-col min-w-0 break-words bg-white w-full mb-6 shadow-xl rounded-lg -mt-64");
    			attr(div14, "class", "w-full");
    			attr(div15, "class", "ideas-section mt-4");
    			attr(button1, "class", "bg-red-500 text-white font-bold py-2 px-4 rounded");
    			attr(div16, "class", "flex justify-end mt-0 items-center mr-0");
    			attr(div17, "class", "profile-section");
    			attr(div18, "class", "container mx-auto px-4");
    			attr(div19, "class", "content-container svelte-11wt8pz");
    			attr(section1, "class", "content-container relative py-16 bg-blueGray-200 svelte-11wt8pz");
    			attr(div20, "class", div20_class_value = "" + (null_to_empty(/*contentContainerClass*/ ctx[7]) + " svelte-11wt8pz"));
    			attr(div21, "class", "flex-grow svelte-11wt8pz");
    			attr(div22, "class", "flex");
    			attr(main, "class", "overview-page bg-blueGray-200");
    			set_style(div23, "position", "relative");
    		},
    		m(target, anchor) {
    			insert(target, div23, anchor);
    			append(div23, main);
    			append(main, div22);
    			mount_component(menu, div22, null);
    			append(div22, t0);
    			append(div22, div21);
    			append(div21, section0);
    			append(section0, div3);
    			append(div3, span);
    			append(div3, t1);
    			append(div3, div1);
    			append(div1, div0);
    			append(div0, t2);
    			append(div3, t3);
    			append(div3, div2);
    			append(div2, button0);
    			append(div2, t4);
    			append(div2, a);
    			append(a, i);
    			append(section0, t5);
    			append(section0, div4);
    			append(div21, t6);
    			append(div21, div20);
    			append(div20, section1);
    			append(section1, div19);
    			append(div19, div18);
    			append(div18, div17);
    			append(div17, div13);
    			if (if_block0) if_block0.m(div13, null);
    			append(div13, t7);
    			append(div13, div12);
    			append(div12, div7);
    			append(div7, div6);
    			append(div6, div5);
    			if (if_block1) if_block1.m(div5, null);
    			append(div12, t8);
    			append(div12, div11);
    			append(div11, div10);
    			append(div10, div9);
    			append(div9, div8);
    			div8.innerHTML = /*about*/ ctx[3];
    			append(div17, t9);
    			append(div17, div15);
    			append(div15, div14);
    			mount_component(userideas, div14, null);
    			append(div17, t10);
    			append(div17, div16);
    			append(div16, button1);
    			append(div20, t12);
    			mount_component(footer, div20, null);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen(button0, "click", /*supportIdea*/ ctx[9]),
    					listen(button1, "click", /*click_handler_1*/ ctx[12])
    				];

    				mounted = true;
    			}
    		},
    		p(ctx, [dirty]) {
    			if (!current || dirty & /*name*/ 4) set_data(t2, /*name*/ ctx[2]);

    			if (!current || dirty & /*titleClass*/ 256 && div0_class_value !== (div0_class_value = "" + (null_to_empty(/*titleClass*/ ctx[8]) + " svelte-11wt8pz"))) {
    				attr(div0, "class", div0_class_value);
    			}

    			if (!current || dirty & /*ghUser*/ 32 && a_href_value !== (a_href_value = "https://www.github.com/" + /*ghUser*/ ctx[5])) {
    				attr(a, "href", a_href_value);
    			}

    			if (!current || dirty & /*banner*/ 16 && div3_style_value !== (div3_style_value = `background-image: url(${/*banner*/ ctx[4]});`)) {
    				attr(div3, "style", div3_style_value);
    			}

    			if (/*profile_id*/ ctx[0] === /*publicKey*/ ctx[6]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_1$1(ctx);
    					if_block0.c();
    					if_block0.m(div13, t7);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*profile*/ ctx[1] && /*profile*/ ctx[1].picture) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty & /*profile*/ 2) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block$1(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(div5, null);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}

    			if (!current || dirty & /*about*/ 8) div8.innerHTML = /*about*/ ctx[3];			const userideas_changes = {};
    			if (dirty & /*profile_id*/ 1) userideas_changes.profile_id = /*profile_id*/ ctx[0];
    			userideas.$set(userideas_changes);

    			if (!current || dirty & /*contentContainerClass*/ 128 && div20_class_value !== (div20_class_value = "" + (null_to_empty(/*contentContainerClass*/ ctx[7]) + " svelte-11wt8pz"))) {
    				attr(div20, "class", div20_class_value);
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(menu.$$.fragment, local);
    			transition_in(if_block1);
    			transition_in(userideas.$$.fragment, local);
    			transition_in(footer.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(menu.$$.fragment, local);
    			transition_out(if_block1);
    			transition_out(userideas.$$.fragment, local);
    			transition_out(footer.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(div23);
    			destroy_component(menu);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			destroy_component(userideas);
    			destroy_component(footer);
    			mounted = false;
    			run_all(dispose);
    		}
    	};
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let $sidebarOpen;
    	let $helperStore;
    	component_subscribe($$self, sidebarOpen, $$value => $$invalidate(10, $sidebarOpen = $$value));
    	component_subscribe($$self, helperStore, $$value => $$invalidate(15, $helperStore = $$value));

    	let { profile_id } = $$props;
    	let profile = null;
    	let name = "";
    	let about = "";
    	let picture = "";
    	let banner = "";
    	let ghUser = "";
    	let lnAdress = "";
    	let publicKey = "";

    	onMount(async () => {
    		try {
    			$$invalidate(6, publicKey = $helperStore.publicKey);
    			$$invalidate(1, profile = await $helperStore.getProfile(profile_id));

    			if (profile) {
    				$$invalidate(2, name = profile.name);
    				$$invalidate(3, about = profile.dev_about);
    				picture = profile.picture;
    				$$invalidate(4, banner = profile.banner);
    				$$invalidate(5, ghUser = profile.githubUsername);
    				lnAdress = profile.lud16;
    			}
    		} catch(error) {
    			console.error("Error fetching profile:", error);
    		}
    	});

    	async function supportIdea() {
    		await sendSatsLNurl(lnAdress);
    	}

    	let contentContainerClass = "content-container";
    	let titleClass = "title-class";
    	const click_handler = () => navigate(`/edit_profile/${publicKey}`);
    	const click_handler_1 = () => window.history.back();

    	$$self.$$set = $$props => {
    		if ('profile_id' in $$props) $$invalidate(0, profile_id = $$props.profile_id);
    	};

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$sidebarOpen*/ 1024) {
    			{
    				if ($sidebarOpen) {
    					$$invalidate(7, contentContainerClass = "content-container sidebar-open");
    					$$invalidate(8, titleClass = "title-class sidebar-open");
    				} else {
    					$$invalidate(7, contentContainerClass = "content-container");
    					$$invalidate(8, titleClass = "title-class");
    				}
    			}
    		}
    	};

    	return [
    		profile_id,
    		profile,
    		name,
    		about,
    		banner,
    		ghUser,
    		publicKey,
    		contentContainerClass,
    		titleClass,
    		supportIdea,
    		$sidebarOpen,
    		click_handler,
    		click_handler_1
    	];
    }

    class ProfileView extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$1, create_fragment$2, safe_not_equal, { profile_id: 0 });
    	}
    }

    var css_248z = ".content-section.svelte-sbrvtz{display:flex;background-color:#e2e8f0 !important}.content-container.svelte-sbrvtz{flex-grow:1;z-index:0}.title-class.svelte-sbrvtz{position:absolute;left:0;right:0;top:1/2;transition:left 0.3s ease-in-out;left:30px}.title-class.sidebar-open.svelte-sbrvtz{left:215px}.flex-grow.svelte-sbrvtz{z-index:0}.content-container.svelte-sbrvtz{margin-left:0;transition:margin-left 0.3s ease-in-out;flex-grow:1;z-index:0}.content-container.sidebar-open.svelte-sbrvtz{margin-left:200px}";
    styleInject(css_248z);

    /* src/views/IdeaPreview.svelte generated by Svelte v3.59.1 */

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[12] = list[i];
    	return child_ctx;
    }

    // (88:16) {#if creator_profile && creator_profile.picture}
    function create_if_block_1(ctx) {
    	let div;
    	let profileimg;
    	let current;

    	profileimg = new ProfileImg({
    			props: {
    				profile: /*creator_profile*/ ctx[1],
    				style: { width: "40px", height: "40px" }
    			}
    		});

    	return {
    		c() {
    			div = element("div");
    			create_component(profileimg.$$.fragment);
    			set_style(div, "margin-right", "10px");
    		},
    		m(target, anchor) {
    			insert(target, div, anchor);
    			mount_component(profileimg, div, null);
    			current = true;
    		},
    		p(ctx, dirty) {
    			const profileimg_changes = {};
    			if (dirty & /*creator_profile*/ 2) profileimg_changes.profile = /*creator_profile*/ ctx[1];
    			profileimg.$set(profileimg_changes);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(profileimg.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(profileimg.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(div);
    			destroy_component(profileimg);
    		}
    	};
    }

    // (193:22) {#if comment.picture}
    function create_if_block(ctx) {
    	let div;
    	let profileimg;
    	let current;

    	profileimg = new ProfileImg({
    			props: {
    				profile: /*comment*/ ctx[12],
    				style: { width: "40px", height: "40px" }
    			}
    		});

    	return {
    		c() {
    			div = element("div");
    			create_component(profileimg.$$.fragment);
    			set_style(div, "margin-right", "10px");
    		},
    		m(target, anchor) {
    			insert(target, div, anchor);
    			mount_component(profileimg, div, null);
    			current = true;
    		},
    		p: noop,
    		i(local) {
    			if (current) return;
    			transition_in(profileimg.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(profileimg.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(div);
    			destroy_component(profileimg);
    		}
    	};
    }

    // (191:18) {#each comments as comment (comment.id)}
    function create_each_block(key_1, ctx) {
    	let li;
    	let t0;
    	let div;
    	let h3;
    	let t1_value = /*comment*/ ctx[12].name + "";
    	let t1;
    	let t2;
    	let p;
    	let t3_value = /*comment*/ ctx[12].comment + "";
    	let t3;
    	let t4;
    	let current;
    	let if_block = /*comment*/ ctx[12].picture && create_if_block(ctx);

    	return {
    		key: key_1,
    		first: null,
    		c() {
    			li = element("li");
    			if (if_block) if_block.c();
    			t0 = space();
    			div = element("div");
    			h3 = element("h3");
    			t1 = text(t1_value);
    			t2 = space();
    			p = element("p");
    			t3 = text(t3_value);
    			t4 = space();
    			attr(h3, "class", "font-bold text-sm");
    			attr(p, "class", "text-m");
    			attr(li, "class", "flex items-center gap-4 my-2");
    			this.first = li;
    		},
    		m(target, anchor) {
    			insert(target, li, anchor);
    			if (if_block) if_block.m(li, null);
    			append(li, t0);
    			append(li, div);
    			append(div, h3);
    			append(h3, t1);
    			append(div, t2);
    			append(div, p);
    			append(p, t3);
    			append(li, t4);
    			current = true;
    		},
    		p(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (/*comment*/ ctx[12].picture) if_block.p(ctx, dirty);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(li);
    			if (if_block) if_block.d();
    		}
    	};
    }

    // (227:14) <Link to="/postidea">
    function create_default_slot$1(ctx) {
    	let button;

    	return {
    		c() {
    			button = element("button");
    			button.textContent = "Back";
    			attr(button, "class", "bg-red-400 active:bg-red-500 uppercase text-white font-bold hover:shadow-md shadow text-xs px-4 py-2 rounded outline-none focus:outline-none mb-1 ease-linear transition-all duration-150");
    			attr(button, "type", "button");
    		},
    		m(target, anchor) {
    			insert(target, button, anchor);
    		},
    		p: noop,
    		d(detaching) {
    			if (detaching) detach(button);
    		}
    	};
    }

    function create_fragment$1(ctx) {
    	let div14;
    	let main;
    	let div13;
    	let menu;
    	let t0;
    	let div12;
    	let section0;
    	let div2;
    	let span;
    	let t1;
    	let div1;
    	let h1;
    	let t2_value = /*$previewStore*/ ctx[3].name + "";
    	let t2;
    	let t3;
    	let h20;
    	let t4_value = /*$previewStore*/ ctx[3].subtitle + "";
    	let t4;
    	let t5;
    	let div0;
    	let button0;
    	let t6;
    	let t7;
    	let a;
    	let i;
    	let a_href_value;
    	let t8;
    	let div3;
    	let t9;
    	let div11;
    	let section1;
    	let div10;
    	let div7;
    	let div6;
    	let div5;
    	let h3;
    	let t10_value = /*$previewStore*/ ctx[3].name + "";
    	let t10;
    	let t11;
    	let t12;
    	let h21;
    	let t14;
    	let p0;
    	let t15_value = /*$previewStore*/ ctx[3].abstract + "";
    	let t15;
    	let t16;
    	let hr0;
    	let t17;
    	let h22;
    	let t18_value = /*$previewStore*/ ctx[3].name + "";
    	let t18;
    	let t19;
    	let p1;
    	let raw_value = /*$previewStore*/ ctx[3].message + "";
    	let t20;
    	let hr1;
    	let t21;
    	let div4;
    	let p2;
    	let t23;
    	let button1;
    	let t24;
    	let div9;
    	let h4;
    	let t26;
    	let ul;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let t27;
    	let div8;
    	let label;
    	let t29;
    	let textarea;
    	let t30;
    	let button2;
    	let t32;
    	let link;
    	let t33;
    	let footer;
    	let div11_class_value;
    	let current;
    	let mounted;
    	let dispose;
    	menu = new Menu({});
    	let if_block = /*creator_profile*/ ctx[1] && /*creator_profile*/ ctx[1].picture && create_if_block_1(ctx);
    	let each_value = /*comments*/ ctx[4];
    	const get_key = ctx => /*comment*/ ctx[12].id;

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block(key, child_ctx));
    	}

    	link = new Link({
    			props: {
    				to: "/postidea",
    				$$slots: { default: [create_default_slot$1] },
    				$$scope: { ctx }
    			}
    		});

    	footer = new FooterBS({});

    	return {
    		c() {
    			div14 = element("div");
    			main = element("main");
    			div13 = element("div");
    			create_component(menu.$$.fragment);
    			t0 = space();
    			div12 = element("div");
    			section0 = element("section");
    			div2 = element("div");
    			span = element("span");
    			t1 = space();
    			div1 = element("div");
    			h1 = element("h1");
    			t2 = text(t2_value);
    			t3 = space();
    			h20 = element("h2");
    			t4 = text(t4_value);
    			t5 = space();
    			div0 = element("div");
    			button0 = element("button");
    			button0.innerHTML = `<img src="../../img/lightning.png" style="height: 2.5rem; width: 2.5rem;" alt="Support via Bitcoin Lightning"/>`;
    			t6 = space();
    			if (if_block) if_block.c();
    			t7 = space();
    			a = element("a");
    			i = element("i");
    			t8 = space();
    			div3 = element("div");
    			div3.innerHTML = `<svg class="absolute bottom-0 overflow-hidden" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" version="1.1" viewBox="0 0 2560 100" x="0" y="0"><polygon class="text-blueGray-200 fill-current" points="2560 0 2560 100 0 100"></polygon></svg>`;
    			t9 = space();
    			div11 = element("div");
    			section1 = element("section");
    			div10 = element("div");
    			div7 = element("div");
    			div6 = element("div");
    			div5 = element("div");
    			h3 = element("h3");
    			t10 = text(t10_value);
    			t11 = text(" Preview");
    			t12 = space();
    			h21 = element("h2");
    			h21.textContent = `${"Abstract"}`;
    			t14 = space();
    			p0 = element("p");
    			t15 = text(t15_value);
    			t16 = space();
    			hr0 = element("hr");
    			t17 = space();
    			h22 = element("h2");
    			t18 = text(t18_value);
    			t19 = space();
    			p1 = element("p");
    			t20 = space();
    			hr1 = element("hr");
    			t21 = space();
    			div4 = element("div");
    			p2 = element("p");
    			p2.textContent = "Support via";
    			t23 = space();
    			button1 = element("button");
    			button1.innerHTML = `<img src="/img/lightning.png" style="height: 2.5rem; width: 2.5rem;" alt="Support via Bitcoin Lightning"/>`;
    			t24 = space();
    			div9 = element("div");
    			h4 = element("h4");
    			h4.textContent = "Comments";
    			t26 = space();
    			ul = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t27 = space();
    			div8 = element("div");
    			label = element("label");
    			label.textContent = "Your Comment:";
    			t29 = space();
    			textarea = element("textarea");
    			t30 = space();
    			button2 = element("button");
    			button2.textContent = "Send";
    			t32 = space();
    			create_component(link.$$.fragment);
    			t33 = space();
    			create_component(footer.$$.fragment);
    			attr(span, "id", "blackOverlay");
    			attr(span, "class", "w-full h-full absolute opacity-50 bg-black");
    			attr(h1, "class", "text-4xl font-bold text-white");
    			attr(h20, "class", "text-2xl font-light text-white");
    			set_style(button0, "padding", "0");
    			attr(i, "class", "fab fa-github text-white");
    			set_style(i, "font-size", "2.5rem");
    			attr(a, "href", a_href_value = /*$previewStore*/ ctx[3].githubRepo);
    			attr(a, "target", "_blank");
    			attr(div0, "class", "absolute top-4 right-4 text-3xl text-white flex justify-end items-center gap-6");
    			attr(div1, "class", "absolute left-0 right-0 top-1/2 transform -translate-y-1/2 px-4 flex flex-col items-start justify-center h-full");
    			attr(div2, "class", "absolute top-0 w-full h-full bg-center bg-cover");
    			set_style(div2, "background-image", "url(" + /*$previewStore*/ ctx[3].bannerUrl + ")");
    			attr(div3, "class", "top-auto bottom-0 left-0 right-0 w-full absolute pointer-events-none overflow-hidden h-70-px");
    			set_style(div3, "transform", "translateZ(0)");
    			attr(section0, "class", "relative block h-500-px");
    			attr(h3, "class", "text-4xl font-semibold leading-normal mb-2 text-blueGray-700");
    			attr(h21, "class", "text-4xl font-semibold leading-normal mb-2 text-blueGray-700 mt-6");
    			attr(p0, "class", "message-text");
    			set_style(p0, "width", "70%");
    			set_style(p0, "margin", "2rem auto");
    			set_style(p0, "text-align", "justify");
    			set_style(p0, "font-size", "1.2em");
    			set_style(p0, "line-height", "1.6em");
    			attr(hr0, "class", "my-6");
    			attr(h22, "class", "text-4xl font-semibold leading-normal mb-2 text-blueGray-700 mt-6");
    			attr(p1, "class", "message-text");
    			set_style(p1, "width", "70%");
    			set_style(p1, "margin", "0 auto");
    			set_style(p1, "text-align", "justify");
    			attr(hr1, "class", "my-4");
    			attr(p2, "class", "mb-0");
    			set_style(button1, "padding", "0");
    			set_style(button1, "display", "flex");
    			set_style(button1, "align-items", "center");
    			attr(div4, "class", "flex items-center justify-center gap-4");
    			attr(div5, "class", "text-center mt-6");
    			attr(div6, "class", "px-6");
    			attr(div7, "class", "relative flex flex-col min-w-0 break-words bg-white w-full mb-6 shadow-xl rounded-lg");
    			attr(h4, "class", "text-2xl font-semibold text-blueGray-700 mb-4");
    			attr(label, "for", "newComment");
    			attr(label, "class", "text-lg text-blueGray-600");
    			attr(textarea, "id", "newComment");
    			attr(textarea, "class", "w-full h-24 p-2 mt-2 rounded-md border-2 border-blueGray-200");
    			attr(textarea, "placeholder", "Schreibe hier deinen Kommentar...");
    			attr(button2, "class", "bg-red-400 active:bg-red-500 uppercase text-white font-bold hover:shadow-md shadow text-xs px-4 py-2 rounded outline-none focus:outline-none mt-4 mb-1 ease-linear transition-all duration-150");
    			attr(button2, "type", "button");
    			attr(div8, "class", "mt-6");
    			attr(div9, "class", "bg-white w-full mb-6 shadow-xl rounded-lg p-4");
    			attr(div10, "class", "container mx-auto px-4");
    			attr(section1, "class", "content-container relative py-16 bg-blueGray-200 svelte-sbrvtz");
    			attr(div11, "class", div11_class_value = "" + (null_to_empty(/*contentContainerClass*/ ctx[2]) + " svelte-sbrvtz"));
    			attr(div12, "class", "flex-grow svelte-sbrvtz");
    			attr(div13, "class", "flex");
    			attr(main, "class", "overview-page bg-blueGray-200");
    			set_style(div14, "position", "relative");
    		},
    		m(target, anchor) {
    			insert(target, div14, anchor);
    			append(div14, main);
    			append(main, div13);
    			mount_component(menu, div13, null);
    			append(div13, t0);
    			append(div13, div12);
    			append(div12, section0);
    			append(section0, div2);
    			append(div2, span);
    			append(div2, t1);
    			append(div2, div1);
    			append(div1, h1);
    			append(h1, t2);
    			append(div1, t3);
    			append(div1, h20);
    			append(h20, t4);
    			append(div1, t5);
    			append(div1, div0);
    			append(div0, button0);
    			append(div0, t6);
    			if (if_block) if_block.m(div0, null);
    			append(div0, t7);
    			append(div0, a);
    			append(a, i);
    			append(section0, t8);
    			append(section0, div3);
    			append(div12, t9);
    			append(div12, div11);
    			append(div11, section1);
    			append(section1, div10);
    			append(div10, div7);
    			append(div7, div6);
    			append(div6, div5);
    			append(div5, h3);
    			append(h3, t10);
    			append(h3, t11);
    			append(div5, t12);
    			append(div5, h21);
    			append(div5, t14);
    			append(div5, p0);
    			append(p0, t15);
    			append(div5, t16);
    			append(div5, hr0);
    			append(div5, t17);
    			append(div5, h22);
    			append(h22, t18);
    			append(div5, t19);
    			append(div5, p1);
    			p1.innerHTML = raw_value;
    			append(div5, t20);
    			append(div5, hr1);
    			append(div5, t21);
    			append(div5, div4);
    			append(div4, p2);
    			append(div4, t23);
    			append(div4, button1);
    			append(div10, t24);
    			append(div10, div9);
    			append(div9, h4);
    			append(div9, t26);
    			append(div9, ul);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				if (each_blocks[i]) {
    					each_blocks[i].m(ul, null);
    				}
    			}

    			append(div9, t27);
    			append(div9, div8);
    			append(div8, label);
    			append(div8, t29);
    			append(div8, textarea);
    			set_input_value(textarea, /*newComment*/ ctx[0]);
    			append(div8, t30);
    			append(div8, button2);
    			append(div10, t32);
    			mount_component(link, div10, null);
    			append(div11, t33);
    			mount_component(footer, div11, null);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen(button0, "click", /*supportIdea*/ ctx[5]),
    					listen(button1, "click", /*supportIdea*/ ctx[5]),
    					listen(textarea, "input", /*textarea_input_handler*/ ctx[7]),
    					listen(button2, "click", submitComment)
    				];

    				mounted = true;
    			}
    		},
    		p(ctx, [dirty]) {
    			if ((!current || dirty & /*$previewStore*/ 8) && t2_value !== (t2_value = /*$previewStore*/ ctx[3].name + "")) set_data(t2, t2_value);
    			if ((!current || dirty & /*$previewStore*/ 8) && t4_value !== (t4_value = /*$previewStore*/ ctx[3].subtitle + "")) set_data(t4, t4_value);

    			if (/*creator_profile*/ ctx[1] && /*creator_profile*/ ctx[1].picture) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*creator_profile*/ 2) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block_1(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(div0, t7);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}

    			if (!current || dirty & /*$previewStore*/ 8 && a_href_value !== (a_href_value = /*$previewStore*/ ctx[3].githubRepo)) {
    				attr(a, "href", a_href_value);
    			}

    			if (!current || dirty & /*$previewStore*/ 8) {
    				set_style(div2, "background-image", "url(" + /*$previewStore*/ ctx[3].bannerUrl + ")");
    			}

    			if ((!current || dirty & /*$previewStore*/ 8) && t10_value !== (t10_value = /*$previewStore*/ ctx[3].name + "")) set_data(t10, t10_value);
    			if ((!current || dirty & /*$previewStore*/ 8) && t15_value !== (t15_value = /*$previewStore*/ ctx[3].abstract + "")) set_data(t15, t15_value);
    			if ((!current || dirty & /*$previewStore*/ 8) && t18_value !== (t18_value = /*$previewStore*/ ctx[3].name + "")) set_data(t18, t18_value);
    			if ((!current || dirty & /*$previewStore*/ 8) && raw_value !== (raw_value = /*$previewStore*/ ctx[3].message + "")) p1.innerHTML = raw_value;
    			if (dirty & /*comments*/ 16) {
    				each_value = /*comments*/ ctx[4];
    				group_outros();
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, ul, outro_and_destroy_block, create_each_block, null, get_each_context);
    				check_outros();
    			}

    			if (dirty & /*newComment*/ 1) {
    				set_input_value(textarea, /*newComment*/ ctx[0]);
    			}

    			const link_changes = {};

    			if (dirty & /*$$scope*/ 32768) {
    				link_changes.$$scope = { dirty, ctx };
    			}

    			link.$set(link_changes);

    			if (!current || dirty & /*contentContainerClass*/ 4 && div11_class_value !== (div11_class_value = "" + (null_to_empty(/*contentContainerClass*/ ctx[2]) + " svelte-sbrvtz"))) {
    				attr(div11, "class", div11_class_value);
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(menu.$$.fragment, local);
    			transition_in(if_block);

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			transition_in(link.$$.fragment, local);
    			transition_in(footer.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(menu.$$.fragment, local);
    			transition_out(if_block);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			transition_out(link.$$.fragment, local);
    			transition_out(footer.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(div14);
    			destroy_component(menu);
    			if (if_block) if_block.d();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}

    			destroy_component(link);
    			destroy_component(footer);
    			mounted = false;
    			run_all(dispose);
    		}
    	};
    }

    async function submitComment() {
    	
    }

    function instance($$self, $$props, $$invalidate) {
    	let $sidebarOpen;
    	let $previewStore;
    	let $helperStore;
    	component_subscribe($$self, sidebarOpen, $$value => $$invalidate(6, $sidebarOpen = $$value));
    	component_subscribe($$self, previewStore, $$value => $$invalidate(3, $previewStore = $$value));
    	component_subscribe($$self, helperStore, $$value => $$invalidate(9, $helperStore = $$value));

    	let comments = [];
    	let newComment = "";
    	let creator_profile = null;

    	onMount(async () => {
    		await fetchData();
    	});

    	async function fetchData() {
    		try {
    			$$invalidate(1, creator_profile = await $helperStore.getProfile($helperStore.publicKey));
    		} catch(error) {
    			console.error("Error fetching idea data:", error);
    		}
    	}

    	async function supportIdea() {
    		await sendSatsLNurl($previewStore.lnAdress);
    	}

    	let contentContainerClass = "content-container";

    	function textarea_input_handler() {
    		newComment = this.value;
    		$$invalidate(0, newComment);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$sidebarOpen*/ 64) {
    			{
    				if ($sidebarOpen) {
    					$$invalidate(2, contentContainerClass = "content-container sidebar-open");
    				} else {
    					$$invalidate(2, contentContainerClass = "content-container");
    				}
    			}
    		}
    	};

    	return [
    		newComment,
    		creator_profile,
    		contentContainerClass,
    		$previewStore,
    		comments,
    		supportIdea,
    		$sidebarOpen,
    		textarea_input_handler
    	];
    }

    class IdeaPreview extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance, create_fragment$1, safe_not_equal, {});
    	}
    }

    /* src/App.svelte generated by Svelte v3.59.1 */

    function create_default_slot(ctx) {
    	let div;
    	let nav;
    	let t0;
    	let main;
    	let route0;
    	let t1;
    	let route1;
    	let t2;
    	let route2;
    	let t3;
    	let route3;
    	let t4;
    	let route4;
    	let t5;
    	let route5;
    	let t6;
    	let route6;
    	let t7;
    	let route7;
    	let current;

    	route0 = new Route({
    			props: { path: "/", component: Overview }
    		});

    	route1 = new Route({
    			props: { path: "/overview", component: Overview }
    		});

    	route2 = new Route({
    			props: { path: "/preview", component: IdeaPreview }
    		});

    	route3 = new Route({
    			props: {
    				path: "/overview/:category",
    				component: Overview
    			}
    		});

    	route4 = new Route({
    			props: { path: "/idea/:id", component: IdeaDetail }
    		});

    	route5 = new Route({
    			props: { path: "/postidea", component: PostIdea }
    		});

    	route6 = new Route({
    			props: {
    				path: "/edit_profile/:profile_id",
    				component: EditProfileView
    			}
    		});

    	route7 = new Route({
    			props: {
    				path: "/profile/:profile_id",
    				component: ProfileView
    			}
    		});

    	return {
    		c() {
    			div = element("div");
    			nav = element("nav");
    			t0 = space();
    			main = element("main");
    			create_component(route0.$$.fragment);
    			t1 = space();
    			create_component(route1.$$.fragment);
    			t2 = space();
    			create_component(route2.$$.fragment);
    			t3 = space();
    			create_component(route3.$$.fragment);
    			t4 = space();
    			create_component(route4.$$.fragment);
    			t5 = space();
    			create_component(route5.$$.fragment);
    			t6 = space();
    			create_component(route6.$$.fragment);
    			t7 = space();
    			create_component(route7.$$.fragment);
    		},
    		m(target, anchor) {
    			insert(target, div, anchor);
    			append(div, nav);
    			append(div, t0);
    			append(div, main);
    			mount_component(route0, main, null);
    			append(main, t1);
    			mount_component(route1, main, null);
    			append(main, t2);
    			mount_component(route2, main, null);
    			append(main, t3);
    			mount_component(route3, main, null);
    			append(main, t4);
    			mount_component(route4, main, null);
    			append(main, t5);
    			mount_component(route5, main, null);
    			append(main, t6);
    			mount_component(route6, main, null);
    			append(main, t7);
    			mount_component(route7, main, null);
    			current = true;
    		},
    		p: noop,
    		i(local) {
    			if (current) return;
    			transition_in(route0.$$.fragment, local);
    			transition_in(route1.$$.fragment, local);
    			transition_in(route2.$$.fragment, local);
    			transition_in(route3.$$.fragment, local);
    			transition_in(route4.$$.fragment, local);
    			transition_in(route5.$$.fragment, local);
    			transition_in(route6.$$.fragment, local);
    			transition_in(route7.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(route0.$$.fragment, local);
    			transition_out(route1.$$.fragment, local);
    			transition_out(route2.$$.fragment, local);
    			transition_out(route3.$$.fragment, local);
    			transition_out(route4.$$.fragment, local);
    			transition_out(route5.$$.fragment, local);
    			transition_out(route6.$$.fragment, local);
    			transition_out(route7.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(div);
    			destroy_component(route0);
    			destroy_component(route1);
    			destroy_component(route2);
    			destroy_component(route3);
    			destroy_component(route4);
    			destroy_component(route5);
    			destroy_component(route6);
    			destroy_component(route7);
    		}
    	};
    }

    function create_fragment(ctx) {
    	let link;
    	let t;
    	let router;
    	let current;

    	router = new Router({
    			props: {
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			}
    		});

    	return {
    		c() {
    			link = element("link");
    			t = space();
    			create_component(router.$$.fragment);
    			attr(link, "rel", "stylesheet");
    			attr(link, "href", "https://maxcdn.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css");
    		},
    		m(target, anchor) {
    			append(document.head, link);
    			insert(target, t, anchor);
    			mount_component(router, target, anchor);
    			current = true;
    		},
    		p(ctx, [dirty]) {
    			const router_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				router_changes.$$scope = { dirty, ctx };
    			}

    			router.$set(router_changes);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(router.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(router.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			detach(link);
    			if (detaching) detach(t);
    			destroy_component(router, detaching);
    		}
    	};
    }

    class App extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, null, create_fragment, safe_not_equal, {});
    	}
    }

    const app = new App({
      target: document.getElementById("app"),
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
