
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

    function create_fragment$c(ctx) {
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

    function instance$b($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$b, create_fragment$c, safe_not_equal, { basepath: 6, url: 7, history: 8 });
    	}
    }

    /* node_modules/svelte-routing/src/Route.svelte generated by Svelte v3.59.1 */
    const get_default_slot_changes$1 = dirty => ({ params: dirty & /*routeParams*/ 4 });
    const get_default_slot_context$1 = ctx => ({ params: /*routeParams*/ ctx[2] });

    // (44:0) {#if $activeRoute && $activeRoute.route === route}
    function create_if_block$5(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block_1$3, create_else_block$1];
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
    function create_if_block_1$3(ctx) {
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

    function create_fragment$b(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*$activeRoute*/ ctx[1] && /*$activeRoute*/ ctx[1].route === /*route*/ ctx[5] && create_if_block$5(ctx);

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
    					if_block = create_if_block$5(ctx);
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

    function instance$a($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$a, create_fragment$b, safe_not_equal, { path: 6, component: 0 });
    	}
    }

    /* node_modules/svelte-routing/src/Link.svelte generated by Svelte v3.59.1 */
    const get_default_slot_changes = dirty => ({ active: dirty & /*ariaCurrent*/ 4 });
    const get_default_slot_context = ctx => ({ active: !!/*ariaCurrent*/ ctx[2] });

    function create_fragment$a(ctx) {
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

    function instance$9($$self, $$props, $$invalidate) {
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

    		init(this, options, instance$9, create_fragment$a, safe_not_equal, {
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

    function create_fragment$9(ctx) {
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

    function instance$8($$self, $$props, $$invalidate) {
    	let { card } = $$props;

    	$$self.$$set = $$props => {
    		if ('card' in $$props) $$invalidate(0, card = $$props.card);
    	};

    	return [card];
    }

    class IdeaCard extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$8, create_fragment$9, safe_not_equal, { card: 0 });
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

    function create_fragment$8(ctx) {
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

    function instance$7($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$7, create_fragment$8, safe_not_equal, { profile: 4, style: 5 });
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

    class ProfileBuffer {
        constructor() {
            this.profiles = new Map();
        }

        // Hinzufügen eines Profils zur Map
        addProfile(profile) {
            if (!profile) {
                return;
            }
            const timestamp = Date.now();
            this.profiles.set(profile.pubkey, { profile, timestamp });
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
    }

    // helperStore.js

    const helperStore = writable(null);

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
        this.profileBuffer = new ProfileBuffer();
      }

      async getPublicRelaysString() {
        return ["wss://relay.damus.io",
                "wss://nostr-pub.wellorder.net",
                "wss://nostr.bitcoiner.social",
                "wss://nostr-01.bolt.observer"];
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
        let filters = [{ kinds: [this.idea_kind], '#s': ['bitspark'] }];

        if (categories.length > 0) {
          filters = [];
          categories.forEach(category => {
              filters.push({ kinds: [this.idea_kind], '#s': ['bitspark'], '#c': [category] });
          });
        }

        console.log("Filters:", filters);
        
        let ideas = await this.pool.list(this.relays, filters);

        // Get the profiles for each idea and store them in the ideas
        const profilePromises = ideas.map(async idea => {
          const profile = await this.getProfile(idea.pubkey);
          // Set githubVerified property for each idea
          idea.githubVerified = profile.githubVerified || false;
          return idea;
        });

        ideas = await Promise.all(profilePromises);

        console.log("getIdeas:", ideas);
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
        let profile = await this.profileBuffer.getProfile(pubkey);

        if (profile) {
          console.log("getProfile speed up:", profile);
          return profile;
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

        this.profileBuffer.addProfile(event);
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

    NostrHelper.create = async function (write_mode) {
      // Wenn write_mode definiert ist, erstelle eine neue Instanz und speichere sie im Store.
      if (write_mode !== undefined) {
        const instance = new NostrHelper(write_mode);
        await instance.initialize();
        helperStore.set(instance);
        return instance;
      }

      // Wenn write_mode undefined ist, überprüfe, ob etwas im Store gespeichert ist.
      let storedInstance = null;
      const unsubscribe = helperStore.subscribe(value => {
        storedInstance = value;
      });

      // Wenn der Store leer ist, setze write_mode auf false und erstelle eine neue Instanz.
      if (storedInstance === null) {
        const instance = new NostrHelper(false);
        await instance.initialize();
        helperStore.set(instance);
        storedInstance = instance;
      }

      unsubscribe();
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

    var css_248z$1 = "a.menu-item.svelte-1dsy1pg{color:#000;text-decoration:none}a.menu-item.svelte-1dsy1pg:hover{color:#007bff}.menu-card.svelte-1dsy1pg{width:200px;border-radius:20px;padding:20px;color:#000;background:#fff;box-shadow:0px 10px 30px -5px rgba(0, 0, 0, 0.3);transition:box-shadow 0.5s;position:relative}.menu-card.svelte-1dsy1pg:hover{box-shadow:0px 30px 100px -10px rgba(0, 0, 0, 0.4)}.menu-item.svelte-1dsy1pg{font-size:1rem;padding:15px;cursor:pointer;transition:color 0.3s}.menu-item.svelte-1dsy1pg:hover{color:#007bff}.categories.svelte-1dsy1pg{position:absolute;top:0;left:100%;background:#fff;width:150px;padding:10px 0;box-shadow:0px 10px 30px -5px rgba(0, 0, 0, 0.3);border-radius:20px;transition:opacity 0.3s, visibility 0.3s;opacity:1;visibility:visible}.categories.hidden.svelte-1dsy1pg{opacity:0;visibility:hidden}.category-item.svelte-1dsy1pg{color:#000;padding:10px 15px;cursor:pointer;transition:color 0.3s}.category-item.svelte-1dsy1pg:hover{color:#007bff}";
    styleInject(css_248z$1);

    /* src/components/Menu.svelte generated by Svelte v3.59.1 */

    function get_each_context$4(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[12] = list[i];
    	return child_ctx;
    }

    // (79:20) <Link to={`/overview/${category}`}                         >
    function create_default_slot_1(ctx) {
    	let div;
    	let t_value = /*category*/ ctx[12] + "";
    	let t;

    	return {
    		c() {
    			div = element("div");
    			t = text(t_value);
    			attr(div, "class", "category-item svelte-1dsy1pg");
    		},
    		m(target, anchor) {
    			insert(target, div, anchor);
    			append(div, t);
    		},
    		p: noop,
    		d(detaching) {
    			if (detaching) detach(div);
    		}
    	};
    }

    // (78:16) {#each categories as category}
    function create_each_block$4(ctx) {
    	let link_1;
    	let current;

    	link_1 = new Link({
    			props: {
    				to: `/overview/${/*category*/ ctx[12]}`,
    				$$slots: { default: [create_default_slot_1] },
    				$$scope: { ctx }
    			}
    		});

    	return {
    		c() {
    			create_component(link_1.$$.fragment);
    		},
    		m(target, anchor) {
    			mount_component(link_1, target, anchor);
    			current = true;
    		},
    		p(ctx, dirty) {
    			const link_1_changes = {};

    			if (dirty & /*$$scope*/ 32768) {
    				link_1_changes.$$scope = { dirty, ctx };
    			}

    			link_1.$set(link_1_changes);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(link_1.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(link_1.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			destroy_component(link_1, detaching);
    		}
    	};
    }

    // (86:12) <Link to="/postidea" class="menu-item text-black hover:text-blue-500 px-3">
    function create_default_slot$3(ctx) {
    	let t;

    	return {
    		c() {
    			t = text("Spark Idea");
    		},
    		m(target, anchor) {
    			insert(target, t, anchor);
    		},
    		d(detaching) {
    			if (detaching) detach(t);
    		}
    	};
    }

    // (96:12) {:else}
    function create_else_block(ctx) {
    	let button;
    	let mounted;
    	let dispose;

    	return {
    		c() {
    			button = element("button");
    			button.textContent = "Login";
    			attr(button, "class", "menu-item svelte-1dsy1pg");
    		},
    		m(target, anchor) {
    			insert(target, button, anchor);

    			if (!mounted) {
    				dispose = [
    					listen(button, "click", /*login*/ ctx[8]),
    					listen(button, "keydown", /*login*/ ctx[8])
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

    // (92:43) 
    function create_if_block_1$2(ctx) {
    	let button;
    	let mounted;
    	let dispose;

    	return {
    		c() {
    			button = element("button");
    			button.textContent = "Logout";
    			attr(button, "class", "menu-item svelte-1dsy1pg");
    		},
    		m(target, anchor) {
    			insert(target, button, anchor);

    			if (!mounted) {
    				dispose = [
    					listen(button, "click", /*logout*/ ctx[9]),
    					listen(button, "keydown", /*logout*/ ctx[9])
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

    // (89:12) {#if !$menuState.use_extension}
    function create_if_block$4(ctx) {
    	let a;
    	let t;

    	return {
    		c() {
    			a = element("a");
    			t = text(optionText);
    			attr(a, "href", link);
    			attr(a, "class", "menu-item svelte-1dsy1pg");
    			attr(a, "target", "_blank");
    		},
    		m(target, anchor) {
    			insert(target, a, anchor);
    			append(a, t);
    		},
    		p: noop,
    		d(detaching) {
    			if (detaching) detach(a);
    		}
    	};
    }

    function create_fragment$7(ctx) {
    	let div2;
    	let ul;
    	let li0;
    	let div0;
    	let t1;
    	let div1;
    	let div1_class_value;
    	let t2;
    	let li1;
    	let link_1;
    	let t3;
    	let li2;
    	let current;
    	let mounted;
    	let dispose;
    	let each_value = /*categories*/ ctx[3];
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$4(get_each_context$4(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	link_1 = new Link({
    			props: {
    				to: "/postidea",
    				class: "menu-item text-black hover:text-blue-500 px-3",
    				$$slots: { default: [create_default_slot$3] },
    				$$scope: { ctx }
    			}
    		});

    	function select_block_type(ctx, dirty) {
    		if (!/*$menuState*/ ctx[1].use_extension) return create_if_block$4;
    		if (/*$menuState*/ ctx[1].logged_in) return create_if_block_1$2;
    		return create_else_block;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	return {
    		c() {
    			div2 = element("div");
    			ul = element("ul");
    			li0 = element("li");
    			div0 = element("div");
    			div0.innerHTML = `<span class="menu-item svelte-1dsy1pg">Overview</span>`;
    			t1 = space();
    			div1 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t2 = space();
    			li1 = element("li");
    			create_component(link_1.$$.fragment);
    			t3 = space();
    			li2 = element("li");
    			if_block.c();

    			attr(div1, "class", div1_class_value = "" + (null_to_empty(/*showCategories*/ ctx[0]
    			? "categories"
    			: "categories hidden") + " svelte-1dsy1pg"));

    			attr(ul, "class", "flex flex-col items-start");
    			attr(div2, "class", "menu-card svelte-1dsy1pg");
    		},
    		m(target, anchor) {
    			insert(target, div2, anchor);
    			append(div2, ul);
    			append(ul, li0);
    			append(li0, div0);
    			append(li0, t1);
    			append(li0, div1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				if (each_blocks[i]) {
    					each_blocks[i].m(div1, null);
    				}
    			}

    			append(ul, t2);
    			append(ul, li1);
    			mount_component(link_1, li1, null);
    			append(ul, t3);
    			append(ul, li2);
    			if_block.m(li2, null);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen(div0, "mouseover", /*handleMouseOver*/ ctx[4]),
    					listen(div0, "mouseout", /*handleMouseOut*/ ctx[5]),
    					listen(div0, "focus", /*handleFocus*/ ctx[6]),
    					listen(div0, "blur", /*handleBlur*/ ctx[7]),
    					listen(div1, "mouseover", /*handleMouseOver*/ ctx[4]),
    					listen(div1, "mouseout", /*handleMouseOut*/ ctx[5]),
    					listen(div1, "focus", /*handleFocus*/ ctx[6]),
    					listen(div1, "blur", /*handleBlur*/ ctx[7])
    				];

    				mounted = true;
    			}
    		},
    		p(ctx, [dirty]) {
    			if (dirty & /*categories*/ 8) {
    				each_value = /*categories*/ ctx[3];
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$4(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$4(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div1, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}

    			if (!current || dirty & /*showCategories*/ 1 && div1_class_value !== (div1_class_value = "" + (null_to_empty(/*showCategories*/ ctx[0]
    			? "categories"
    			: "categories hidden") + " svelte-1dsy1pg"))) {
    				attr(div1, "class", div1_class_value);
    			}

    			const link_1_changes = {};

    			if (dirty & /*$$scope*/ 32768) {
    				link_1_changes.$$scope = { dirty, ctx };
    			}

    			link_1.$set(link_1_changes);

    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(li2, null);
    				}
    			}
    		},
    		i(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			transition_in(link_1.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			transition_out(link_1.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(div2);
    			destroy_each(each_blocks, detaching);
    			destroy_component(link_1);
    			if_block.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};
    }

    let optionText = "getAlby";
    let link = "https://www.getalby.com";

    function instance$6($$self, $$props, $$invalidate) {
    	let $menuState;
    	const menuState = writable({ logged_in: false, use_extension: false });
    	component_subscribe($$self, menuState, value => $$invalidate(1, $menuState = value));
    	let nostrHelper = null;
    	const categories = ["Category 1", "Category 2", "Category 3"];
    	let showCategories = false;
    	let timeoutId;

    	function handleMouseOver() {
    		clearTimeout(timeoutId);
    		$$invalidate(0, showCategories = true);
    	}

    	function handleMouseOut() {
    		timeoutId = setTimeout(
    			() => {
    				$$invalidate(0, showCategories = false);
    			},
    			200
    		); // 200ms delay before hiding categories
    	}

    	function handleFocus() {
    		$$invalidate(0, showCategories = true);
    	}

    	function handleBlur() {
    		$$invalidate(0, showCategories = false);
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
    		nostrHelper = await NostrHelper.create();
    		console.log("nostrHelper:", nostrHelper);
    		const loggedIn = await nostrHelper.publicKey != null;
    		const usingExtension = await nostrHelper.extensionAvailable();

    		menuState.set({
    			logged_in: loggedIn,
    			use_extension: usingExtension
    		});
    	});

    	return [
    		showCategories,
    		$menuState,
    		menuState,
    		categories,
    		handleMouseOver,
    		handleMouseOut,
    		handleFocus,
    		handleBlur,
    		login,
    		logout
    	];
    }

    class Menu extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$6, create_fragment$7, safe_not_equal, {});
    	}
    }

    var css_248z = ".menu-container.svelte-8hf5w1{width:300px;padding-left:40px}.content-container.svelte-8hf5w1{flex-grow:1}";
    styleInject(css_248z);

    /* src/views/Overview.svelte generated by Svelte v3.59.1 */

    function get_each_context$3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[9] = list[i];
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[9] = list[i];
    	return child_ctx;
    }

    // (127:10) {#if profile}
    function create_if_block$3(ctx) {
    	let div;
    	let profileimg;
    	let current;

    	profileimg = new ProfileImg({
    			props: {
    				profile: /*profile*/ ctx[2],
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
    			if (dirty & /*profile*/ 4) profileimg_changes.profile = /*profile*/ ctx[2];
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

    // (145:12) {#each verifiedCards as card}
    function create_each_block_1(ctx) {
    	let div;
    	let ideacard;
    	let t;
    	let current;
    	ideacard = new IdeaCard({ props: { card: /*card*/ ctx[9] } });

    	return {
    		c() {
    			div = element("div");
    			create_component(ideacard.$$.fragment);
    			t = space();
    			attr(div, "class", "col-12 col-sm-6 col-md-6 col-lg-6 mb-8");
    			set_style(div, "margin-bottom", "2rem");
    		},
    		m(target, anchor) {
    			insert(target, div, anchor);
    			mount_component(ideacard, div, null);
    			append(div, t);
    			current = true;
    		},
    		p(ctx, dirty) {
    			const ideacard_changes = {};
    			if (dirty & /*verifiedCards*/ 1) ideacard_changes.card = /*card*/ ctx[9];
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

    // (160:12) {#each unverifiedCards as card}
    function create_each_block$3(ctx) {
    	let div;
    	let ideacard;
    	let t;
    	let current;
    	ideacard = new IdeaCard({ props: { card: /*card*/ ctx[9] } });

    	return {
    		c() {
    			div = element("div");
    			create_component(ideacard.$$.fragment);
    			t = space();
    			attr(div, "class", "col-12 col-sm-6 col-md-6 col-lg-6 mb-8");
    			set_style(div, "margin-top", "2rem");
    		},
    		m(target, anchor) {
    			insert(target, div, anchor);
    			mount_component(ideacard, div, null);
    			append(div, t);
    			current = true;
    		},
    		p(ctx, dirty) {
    			const ideacard_changes = {};
    			if (dirty & /*unverifiedCards*/ 2) ideacard_changes.card = /*card*/ ctx[9];
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

    function create_fragment$6(ctx) {
    	let div10;
    	let main;
    	let section0;
    	let div3;
    	let span;
    	let t0;
    	let div0;
    	let t4;
    	let div1;
    	let t5;
    	let div2;
    	let t6;
    	let section1;
    	let div4;
    	let menu;
    	let t7;
    	let div9;
    	let div8;
    	let div5;
    	let t8;
    	let div6;
    	let t9;
    	let div7;
    	let current;
    	let if_block = /*profile*/ ctx[2] && create_if_block$3(ctx);

    	menu = new Menu({
    			props: { menuState: /*menuState*/ ctx[3] }
    		});

    	let each_value_1 = /*verifiedCards*/ ctx[0];
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks_1[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	const out = i => transition_out(each_blocks_1[i], 1, 1, () => {
    		each_blocks_1[i] = null;
    	});

    	let each_value = /*unverifiedCards*/ ctx[1];
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$3(get_each_context$3(ctx, each_value, i));
    	}

    	const out_1 = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	return {
    		c() {
    			div10 = element("div");
    			main = element("main");
    			section0 = element("section");
    			div3 = element("div");
    			span = element("span");
    			t0 = space();
    			div0 = element("div");

    			div0.innerHTML = `<h1 class="text-4xl font-bold text-white">BitSpark</h1> 
          <h2 class="text-2xl font-light text-white">Idea Engine</h2>`;

    			t4 = space();
    			div1 = element("div");
    			div1.innerHTML = `<svg class="absolute bottom-0 overflow-hidden" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" version="1.1" viewBox="0 0 2560 100" x="0" y="0"><polygon class="text-blueGray-200 fill-current" points="2560 0 2560 100 0 100"></polygon></svg>`;
    			t5 = space();
    			div2 = element("div");
    			if (if_block) if_block.c();
    			t6 = space();
    			section1 = element("section");
    			div4 = element("div");
    			create_component(menu.$$.fragment);
    			t7 = space();
    			div9 = element("div");
    			div8 = element("div");
    			div5 = element("div");

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t8 = space();
    			div6 = element("div");
    			t9 = space();
    			div7 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr(span, "id", "blackOverlay");
    			attr(span, "class", "w-full h-full absolute opacity-50 bg-black");
    			attr(div0, "class", "absolute left-0 right-0 top-1/2 transform -translate-y-1/2 px-4 flex flex-col items-start justify-center h-full");
    			attr(div1, "class", "top-auto bottom-0 left-0 right-0 w-full absolute pointer-events-none overflow-hidden h-70-px");
    			set_style(div1, "transform", "translateZ(0)");
    			attr(div2, "class", "absolute top-4 right-4 flex justify-end w-full");
    			attr(div3, "class", "absolute top-0 w-full h-full bg-center bg-cover");
    			set_style(div3, "background-image", "url(https://images.unsplash.com/photo-1499336315816-097655dcfbda?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=2710&q=80)");
    			attr(section0, "class", "relative block h-500-px");
    			attr(div4, "class", "menu-container svelte-8hf5w1");
    			attr(div5, "class", "row");
    			set_style(div6, "margin-top", "2rem");
    			set_style(div6, "margin-bottom", "2rem");
    			set_style(div6, "height", "2px");
    			set_style(div6, "background-color", "gray");
    			attr(div6, "class", "w-full");
    			attr(div7, "class", "row");
    			attr(div8, "class", "container mx-auto px-4");
    			attr(div9, "class", "content-container svelte-8hf5w1");
    			attr(section1, "class", "relative py-16 bg-blueGray-200");
    			set_style(section1, "display", "flex");
    			attr(main, "class", "overview-page");
    			set_style(div10, "position", "relative");
    		},
    		m(target, anchor) {
    			insert(target, div10, anchor);
    			append(div10, main);
    			append(main, section0);
    			append(section0, div3);
    			append(div3, span);
    			append(div3, t0);
    			append(div3, div0);
    			append(div3, t4);
    			append(div3, div1);
    			append(div3, t5);
    			append(div3, div2);
    			if (if_block) if_block.m(div2, null);
    			append(main, t6);
    			append(main, section1);
    			append(section1, div4);
    			mount_component(menu, div4, null);
    			append(section1, t7);
    			append(section1, div9);
    			append(div9, div8);
    			append(div8, div5);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				if (each_blocks_1[i]) {
    					each_blocks_1[i].m(div5, null);
    				}
    			}

    			append(div8, t8);
    			append(div8, div6);
    			append(div8, t9);
    			append(div8, div7);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				if (each_blocks[i]) {
    					each_blocks[i].m(div7, null);
    				}
    			}

    			current = true;
    		},
    		p(ctx, [dirty]) {
    			if (/*profile*/ ctx[2]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*profile*/ 4) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$3(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(div2, null);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}

    			if (dirty & /*verifiedCards*/ 1) {
    				each_value_1 = /*verifiedCards*/ ctx[0];
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    						transition_in(each_blocks_1[i], 1);
    					} else {
    						each_blocks_1[i] = create_each_block_1(child_ctx);
    						each_blocks_1[i].c();
    						transition_in(each_blocks_1[i], 1);
    						each_blocks_1[i].m(div5, null);
    					}
    				}

    				group_outros();

    				for (i = each_value_1.length; i < each_blocks_1.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}

    			if (dirty & /*unverifiedCards*/ 2) {
    				each_value = /*unverifiedCards*/ ctx[1];
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$3(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$3(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div7, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out_1(i);
    				}

    				check_outros();
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(if_block);
    			transition_in(menu.$$.fragment, local);

    			for (let i = 0; i < each_value_1.length; i += 1) {
    				transition_in(each_blocks_1[i]);
    			}

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o(local) {
    			transition_out(if_block);
    			transition_out(menu.$$.fragment, local);
    			each_blocks_1 = each_blocks_1.filter(Boolean);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				transition_out(each_blocks_1[i]);
    			}

    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(div10);
    			if (if_block) if_block.d();
    			destroy_component(menu);
    			destroy_each(each_blocks_1, detaching);
    			destroy_each(each_blocks, detaching);
    		}
    	};
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let $helperStore;
    	component_subscribe($$self, helperStore, $$value => $$invalidate(5, $helperStore = $$value));
    	let verifiedCards = [];
    	let unverifiedCards = [];
    	let publicKey = "";
    	let profilePicture = "";
    	let profile = null;
    	let menuState = { logged_in: false, use_extension: true };
    	let { category } = $$props;

    	async function update() {
    		const nostrHelper = await NostrHelper.create();
    		publicKey = nostrHelper.publicKey;
    		$$invalidate(2, profile = await nostrHelper.getProfile(publicKey));
    		profilePicture = profile.picture;
    	}

    	onMount(async () => {
    		try {
    			const nostrHelper = await NostrHelper.create();
    			publicKey = nostrHelper.publicKey;
    			$$invalidate(2, profile = await nostrHelper.getProfile(publicKey));
    			profilePicture = profile.picture;
    			console.log("category:", category);
    			let ideas;

    			if (category) {
    				ideas = await nostrHelper.getIdeas([category]);
    			} else {
    				ideas = await nostrHelper.getIdeas();
    			}

    			let verified = [];
    			let unverified = [];

    			ideas.forEach(idea => {
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
    			$$invalidate(0, verifiedCards = verified);

    			$$invalidate(1, unverifiedCards = unverified);
    		} catch(error) {
    			console.error("Error fetching cards:", error);
    		}
    	});

    	$$self.$$set = $$props => {
    		if ('category' in $$props) $$invalidate(4, category = $$props.category);
    	};

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$helperStore*/ 32) {
    			if ($helperStore) {
    				update();
    			} else {
    				update();
    			}
    		}
    	};

    	return [verifiedCards, unverifiedCards, profile, menuState, category, $helperStore];
    }

    class Overview extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$5, create_fragment$6, safe_not_equal, { category: 4 });
    	}
    }

    async function sendSatsLNurl(lnurl) {
        if (typeof window.webln !== "undefined") {
          await window.webln.enable();
          await webln.lnurl(lnurl);
        }
      }

    /* src/views/IdeaDetail.svelte generated by Svelte v3.59.1 */

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[11] = list[i];
    	return child_ctx;
    }

    // (131:12) {#if creator_profile && creator_profile.picture}
    function create_if_block_1$1(ctx) {
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

    // (232:16) {#if comment.picture}
    function create_if_block$2(ctx) {
    	let div;
    	let profileimg;
    	let current;

    	profileimg = new ProfileImg({
    			props: {
    				profile: /*comment*/ ctx[11],
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
    			if (dirty & /*comments*/ 2) profileimg_changes.profile = /*comment*/ ctx[11];
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

    // (230:12) {#each comments as comment (comment.id)}
    function create_each_block$2(key_1, ctx) {
    	let li;
    	let t0;
    	let div;
    	let h3;
    	let t1_value = /*comment*/ ctx[11].name + "";
    	let t1;
    	let t2;
    	let p;
    	let t3_value = /*comment*/ ctx[11].comment + "";
    	let t3;
    	let t4;
    	let current;
    	let if_block = /*comment*/ ctx[11].picture && create_if_block$2(ctx);

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

    			if (/*comment*/ ctx[11].picture) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*comments*/ 2) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$2(ctx);
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

    			if ((!current || dirty & /*comments*/ 2) && t1_value !== (t1_value = /*comment*/ ctx[11].name + "")) set_data(t1, t1_value);
    			if ((!current || dirty & /*comments*/ 2) && t3_value !== (t3_value = /*comment*/ ctx[11].comment + "")) set_data(t3, t3_value);
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

    // (266:8) <Link to="/overview">
    function create_default_slot$2(ctx) {
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

    function create_fragment$5(ctx) {
    	let div11;
    	let main;
    	let section0;
    	let div2;
    	let span;
    	let t0;
    	let div1;
    	let h1;
    	let t1_value = /*idea*/ ctx[0].name + "";
    	let t1;
    	let t2;
    	let h20;
    	let t3_value = /*idea*/ ctx[0].subtitle + "";
    	let t3;
    	let t4;
    	let div0;
    	let button0;
    	let t5;
    	let t6;
    	let a;
    	let i;
    	let a_href_value;
    	let t7;
    	let div3;
    	let t8;
    	let section1;
    	let div10;
    	let div7;
    	let div6;
    	let div5;
    	let h3;
    	let t9_value = /*idea*/ ctx[0].name + "";
    	let t9;
    	let t10;
    	let h21;
    	let t12;
    	let p0;
    	let t13_value = /*idea*/ ctx[0].abstract + "";
    	let t13;
    	let t14;
    	let hr0;
    	let t15;
    	let h22;
    	let t16_value = /*idea*/ ctx[0].name + "";
    	let t16;
    	let t17;
    	let p1;
    	let raw_value = /*idea*/ ctx[0].message + "";
    	let t18;
    	let hr1;
    	let t19;
    	let div4;
    	let p2;
    	let t21;
    	let button1;
    	let t22;
    	let div9;
    	let h4;
    	let t24;
    	let ul;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let t25;
    	let div8;
    	let label;
    	let t27;
    	let textarea;
    	let t28;
    	let button2;
    	let t30;
    	let link;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block = /*creator_profile*/ ctx[3] && /*creator_profile*/ ctx[3].picture && create_if_block_1$1(ctx);
    	let each_value = /*comments*/ ctx[1];
    	const get_key = ctx => /*comment*/ ctx[11].id;

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$2(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block$2(key, child_ctx));
    	}

    	link = new Link({
    			props: {
    				to: "/overview",
    				$$slots: { default: [create_default_slot$2] },
    				$$scope: { ctx }
    			}
    		});

    	return {
    		c() {
    			div11 = element("div");
    			main = element("main");
    			section0 = element("section");
    			div2 = element("div");
    			span = element("span");
    			t0 = space();
    			div1 = element("div");
    			h1 = element("h1");
    			t1 = text(t1_value);
    			t2 = space();
    			h20 = element("h2");
    			t3 = text(t3_value);
    			t4 = space();
    			div0 = element("div");
    			button0 = element("button");
    			button0.innerHTML = `<img src="../../img/lightning.png" style="height: 2.5rem; width: 2.5rem;" alt="Support via Bitcoin Lightning"/>`;
    			t5 = space();
    			if (if_block) if_block.c();
    			t6 = space();
    			a = element("a");
    			i = element("i");
    			t7 = space();
    			div3 = element("div");
    			div3.innerHTML = `<svg class="absolute bottom-0 overflow-hidden" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" version="1.1" viewBox="0 0 2560 100" x="0" y="0"><polygon class="text-blueGray-200 fill-current" points="2560 0 2560 100 0 100"></polygon></svg>`;
    			t8 = space();
    			section1 = element("section");
    			div10 = element("div");
    			div7 = element("div");
    			div6 = element("div");
    			div5 = element("div");
    			h3 = element("h3");
    			t9 = text(t9_value);
    			t10 = space();
    			h21 = element("h2");
    			h21.textContent = `${"Abstract"}`;
    			t12 = space();
    			p0 = element("p");
    			t13 = text(t13_value);
    			t14 = space();
    			hr0 = element("hr");
    			t15 = space();
    			h22 = element("h2");
    			t16 = text(t16_value);
    			t17 = space();
    			p1 = element("p");
    			t18 = space();
    			hr1 = element("hr");
    			t19 = space();
    			div4 = element("div");
    			p2 = element("p");
    			p2.textContent = "Support via";
    			t21 = space();
    			button1 = element("button");
    			button1.innerHTML = `<img src="/img/lightning.png" style="height: 2.5rem; width: 2.5rem;" alt="Support via Bitcoin Lightning"/>`;
    			t22 = space();
    			div9 = element("div");
    			h4 = element("h4");
    			h4.textContent = "Kommentare";
    			t24 = space();
    			ul = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t25 = space();
    			div8 = element("div");
    			label = element("label");
    			label.textContent = "Dein Kommentar:";
    			t27 = space();
    			textarea = element("textarea");
    			t28 = space();
    			button2 = element("button");
    			button2.textContent = "Kommentar absenden";
    			t30 = space();
    			create_component(link.$$.fragment);
    			attr(span, "id", "blackOverlay");
    			attr(span, "class", "w-full h-full absolute opacity-50 bg-black");
    			attr(h1, "class", "text-4xl font-bold text-white");
    			attr(h20, "class", "text-2xl font-light text-white");
    			set_style(button0, "padding", "0");
    			attr(i, "class", "fab fa-github text-white");
    			set_style(i, "font-size", "2.5rem");
    			attr(a, "href", a_href_value = /*idea*/ ctx[0].githubRepo);
    			attr(a, "target", "_blank");
    			attr(div0, "class", "absolute top-4 right-4 text-3xl text-white flex justify-end items-center gap-6");
    			attr(div1, "class", "absolute left-0 right-0 top-1/2 transform -translate-y-1/2 px-4 flex flex-col items-start justify-center h-full");
    			attr(div2, "class", "absolute top-0 w-full h-full bg-center bg-cover");
    			set_style(div2, "background-image", "url(" + /*idea*/ ctx[0].bannerImage + ")");
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
    			attr(section1, "class", "relative py-16 bg-blueGray-200");
    			attr(main, "class", "profile-page");
    		},
    		m(target, anchor) {
    			insert(target, div11, anchor);
    			append(div11, main);
    			append(main, section0);
    			append(section0, div2);
    			append(div2, span);
    			append(div2, t0);
    			append(div2, div1);
    			append(div1, h1);
    			append(h1, t1);
    			append(div1, t2);
    			append(div1, h20);
    			append(h20, t3);
    			append(div1, t4);
    			append(div1, div0);
    			append(div0, button0);
    			append(div0, t5);
    			if (if_block) if_block.m(div0, null);
    			append(div0, t6);
    			append(div0, a);
    			append(a, i);
    			append(section0, t7);
    			append(section0, div3);
    			append(main, t8);
    			append(main, section1);
    			append(section1, div10);
    			append(div10, div7);
    			append(div7, div6);
    			append(div6, div5);
    			append(div5, h3);
    			append(h3, t9);
    			append(div5, t10);
    			append(div5, h21);
    			append(div5, t12);
    			append(div5, p0);
    			append(p0, t13);
    			append(div5, t14);
    			append(div5, hr0);
    			append(div5, t15);
    			append(div5, h22);
    			append(h22, t16);
    			append(div5, t17);
    			append(div5, p1);
    			p1.innerHTML = raw_value;
    			append(div5, t18);
    			append(div5, hr1);
    			append(div5, t19);
    			append(div5, div4);
    			append(div4, p2);
    			append(div4, t21);
    			append(div4, button1);
    			append(div10, t22);
    			append(div10, div9);
    			append(div9, h4);
    			append(div9, t24);
    			append(div9, ul);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				if (each_blocks[i]) {
    					each_blocks[i].m(ul, null);
    				}
    			}

    			append(div9, t25);
    			append(div9, div8);
    			append(div8, label);
    			append(div8, t27);
    			append(div8, textarea);
    			set_input_value(textarea, /*newComment*/ ctx[2]);
    			append(div8, t28);
    			append(div8, button2);
    			append(div10, t30);
    			mount_component(link, div10, null);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen(button0, "click", /*supportIdea*/ ctx[4]),
    					listen(button1, "click", /*supportIdea*/ ctx[4]),
    					listen(textarea, "input", /*textarea_input_handler*/ ctx[7]),
    					listen(button2, "click", /*submitComment*/ ctx[5])
    				];

    				mounted = true;
    			}
    		},
    		p(ctx, [dirty]) {
    			if ((!current || dirty & /*idea*/ 1) && t1_value !== (t1_value = /*idea*/ ctx[0].name + "")) set_data(t1, t1_value);
    			if ((!current || dirty & /*idea*/ 1) && t3_value !== (t3_value = /*idea*/ ctx[0].subtitle + "")) set_data(t3, t3_value);

    			if (/*creator_profile*/ ctx[3] && /*creator_profile*/ ctx[3].picture) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*creator_profile*/ 8) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block_1$1(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(div0, t6);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}

    			if (!current || dirty & /*idea*/ 1 && a_href_value !== (a_href_value = /*idea*/ ctx[0].githubRepo)) {
    				attr(a, "href", a_href_value);
    			}

    			if (!current || dirty & /*idea*/ 1) {
    				set_style(div2, "background-image", "url(" + /*idea*/ ctx[0].bannerImage + ")");
    			}

    			if ((!current || dirty & /*idea*/ 1) && t9_value !== (t9_value = /*idea*/ ctx[0].name + "")) set_data(t9, t9_value);
    			if ((!current || dirty & /*idea*/ 1) && t13_value !== (t13_value = /*idea*/ ctx[0].abstract + "")) set_data(t13, t13_value);
    			if ((!current || dirty & /*idea*/ 1) && t16_value !== (t16_value = /*idea*/ ctx[0].name + "")) set_data(t16, t16_value);
    			if ((!current || dirty & /*idea*/ 1) && raw_value !== (raw_value = /*idea*/ ctx[0].message + "")) p1.innerHTML = raw_value;
    			if (dirty & /*comments*/ 2) {
    				each_value = /*comments*/ ctx[1];
    				group_outros();
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, ul, outro_and_destroy_block, create_each_block$2, null, get_each_context$2);
    				check_outros();
    			}

    			if (dirty & /*newComment*/ 4) {
    				set_input_value(textarea, /*newComment*/ ctx[2]);
    			}

    			const link_changes = {};

    			if (dirty & /*$$scope*/ 16384) {
    				link_changes.$$scope = { dirty, ctx };
    			}

    			link.$set(link_changes);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(if_block);

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			transition_in(link.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(if_block);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			transition_out(link.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(div11);
    			if (if_block) if_block.d();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}

    			destroy_component(link);
    			mounted = false;
    			run_all(dispose);
    		}
    	};
    }

    function instance$4($$self, $$props, $$invalidate) {
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

    	onMount(async () => {
    		await fetchData();
    		await fetchComments();
    	});

    	async function fetchData() {
    		try {
    			const nostrHelper = await NostrHelper.create();
    			const fetchedIdea = await nostrHelper.getEvent(id);

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
    			$$invalidate(3, creator_profile = await nostrHelper.getProfile(fetchedIdea.pubkey));

    			console.log("creator_profile");
    			console.log(creator_profile);
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
    			const bitstarterHelper = await NostrHelper.create();
    			const fetchedComments = await bitstarterHelper.getComments(id);

    			$$invalidate(1, comments = await Promise.all(fetchedComments.map(async comment => {
    				const profile = await bitstarterHelper.getProfile(comment.pubkey);
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
    			const bitstarterHelper = await NostrHelper.create();
    			const commentId = await bitstarterHelper.postComment(id, newComment);
    			await fetchComments();
    			$$invalidate(2, newComment = "");
    		} catch(error) {
    			console.error("Error submitting comment:", error);
    		}
    	}

    	function textarea_input_handler() {
    		newComment = this.value;
    		$$invalidate(2, newComment);
    	}

    	$$self.$$set = $$props => {
    		if ('id' in $$props) $$invalidate(6, id = $$props.id);
    	};

    	return [
    		idea,
    		comments,
    		newComment,
    		creator_profile,
    		supportIdea,
    		submitComment,
    		id,
    		textarea_input_handler
    	];
    }

    class IdeaDetail extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$4, create_fragment$5, safe_not_equal, { id: 6 });
    	}
    }

    /* src/components/Dropdowns/MultiSelectDropdown.svelte generated by Svelte v3.59.1 */

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[8] = list[i];
    	child_ctx[9] = list;
    	child_ctx[10] = i;
    	return child_ctx;
    }

    // (30:4) {#each categories as category}
    function create_each_block$1(ctx) {
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

    function create_fragment$4(ctx) {
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
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
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
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
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

    function instance$3($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$3, create_fragment$4, safe_not_equal, { categories: 0, selected: 4 });
    	}
    }

    /* src/views/PostIdea.svelte generated by Svelte v3.59.1 */

    function create_default_slot$1(ctx) {
    	let t;

    	return {
    		c() {
    			t = text("Back to Home");
    		},
    		m(target, anchor) {
    			insert(target, t, anchor);
    		},
    		d(detaching) {
    			if (detaching) detach(t);
    		}
    	};
    }

    function create_fragment$3(ctx) {
    	let main;
    	let section0;
    	let t5;
    	let section1;
    	let div13;
    	let div12;
    	let h21;
    	let t7;
    	let div11;
    	let div3;
    	let input0;
    	let t8;
    	let div4;
    	let input1;
    	let t9;
    	let div5;
    	let textarea0;
    	let t10;
    	let div6;
    	let textarea1;
    	let t11;
    	let div7;
    	let input2;
    	let t12;
    	let div8;
    	let input3;
    	let t13;
    	let div9;
    	let input4;
    	let t14;
    	let div10;
    	let multiselectdropdown;
    	let updating_selected;
    	let t15;
    	let div14;
    	let button;
    	let t17;
    	let link;
    	let t18;
    	let section2;
    	let current;
    	let mounted;
    	let dispose;

    	function multiselectdropdown_selected_binding(value) {
    		/*multiselectdropdown_selected_binding*/ ctx[17](value);
    	}

    	let multiselectdropdown_props = { categories: /*categories*/ ctx[8] };

    	if (/*selectedCategories*/ ctx[7] !== void 0) {
    		multiselectdropdown_props.selected = /*selectedCategories*/ ctx[7];
    	}

    	multiselectdropdown = new MultiSelectDropdown({ props: multiselectdropdown_props });
    	binding_callbacks.push(() => bind(multiselectdropdown, 'selected', multiselectdropdown_selected_binding));

    	link = new Link({
    			props: {
    				to: "/overview",
    				class: "bg-white text-red-500 font-bold py-2 px-4 block rounded border border-red-500 ml-4 mt-2 hover:bg-red-500 hover:text-white",
    				$$slots: { default: [create_default_slot$1] },
    				$$scope: { ctx }
    			}
    		});

    	return {
    		c() {
    			main = element("main");
    			section0 = element("section");

    			section0.innerHTML = `<div class="absolute top-0 w-full h-full bg-center bg-cover" style="background-image: url(https://images.unsplash.com/photo-1499336315816-097655dcfbda?ixlib=rb-1.2.1&amp;ixid=eyJhcHBfaWQiOjEyMDd9&amp;auto=format&amp;fit=crop&amp;w=2710&amp;q=80); "><span id="blackOverlay" class="w-full h-full absolute opacity-50 bg-black"></span> 

            <div class="absolute left-0 right-0 top-1/2 transform -translate-y-1/2 px-4 flex flex-col items-start justify-center h-full"><h1 class="text-4xl font-bold text-white">BitSpark</h1> 
                <h2 class="text-2xl font-light text-white">Spark Idea</h2></div></div> 
        
        <div class="top-auto bottom-0 left-0 right-0 w-full absolute pointer-events-none overflow-hidden h-70-px" style="transform: translateZ(0);"><svg class="absolute bottom-0 overflow-hidden" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" version="1.1" viewBox="0 0 2560 100" x="0" y="0"><polygon class="text-blueGray-200 fill-current" points="2560 0 2560 100 0 100"></polygon></svg></div>`;

    			t5 = space();
    			section1 = element("section");
    			div13 = element("div");
    			div12 = element("div");
    			h21 = element("h2");
    			h21.textContent = "Spark Idea";
    			t7 = space();
    			div11 = element("div");
    			div3 = element("div");
    			input0 = element("input");
    			t8 = space();
    			div4 = element("div");
    			input1 = element("input");
    			t9 = space();
    			div5 = element("div");
    			textarea0 = element("textarea");
    			t10 = space();
    			div6 = element("div");
    			textarea1 = element("textarea");
    			t11 = space();
    			div7 = element("div");
    			input2 = element("input");
    			t12 = space();
    			div8 = element("div");
    			input3 = element("input");
    			t13 = space();
    			div9 = element("div");
    			input4 = element("input");
    			t14 = space();
    			div10 = element("div");
    			create_component(multiselectdropdown.$$.fragment);
    			t15 = space();
    			div14 = element("div");
    			button = element("button");
    			button.textContent = "Spark Idea";
    			t17 = space();
    			create_component(link.$$.fragment);
    			t18 = space();
    			section2 = element("section");
    			attr(section0, "class", "relative block h-500-px");
    			attr(h21, "class", "text-2xl font-semibold mb-4");
    			attr(input0, "type", "text");
    			attr(input0, "placeholder", "Idea Name");
    			attr(input0, "class", "flex justify-center block rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50");
    			set_style(input0, "width", "90%");
    			attr(div3, "class", "mb-4");
    			attr(input1, "type", "text");
    			attr(input1, "placeholder", "Idea Subtitle");
    			attr(input1, "class", "flex justify-center block rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50");
    			set_style(input1, "width", "90%");
    			attr(div4, "class", "mb-4");
    			attr(textarea0, "rows", "1");
    			attr(textarea0, "placeholder", "Abstract");
    			attr(textarea0, "class", "flex justify-center block rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 resize-none overflow-hidden");
    			set_style(textarea0, "width", "90%");
    			attr(div5, "class", "mb-4");
    			attr(textarea1, "rows", "1");
    			attr(textarea1, "placeholder", "Description");
    			attr(textarea1, "class", "flex justify-center block rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 resize-none overflow-hidden");
    			set_style(textarea1, "width", "90%");
    			attr(div6, "class", "mb-4");
    			attr(input2, "type", "text");
    			attr(input2, "placeholder", "Banner URL");
    			attr(input2, "class", "flex justify-center block rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50");
    			set_style(input2, "width", "90%");
    			attr(div7, "class", "mb-4");
    			attr(input3, "type", "text");
    			attr(input3, "placeholder", "GitHub Repository");
    			attr(input3, "class", "flex justify-center block rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50");
    			set_style(input3, "width", "90%");
    			attr(div8, "class", "mb-4");
    			attr(input4, "type", "text");
    			attr(input4, "placeholder", "Lightning Address");
    			attr(input4, "class", "flex justify-center block rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50");
    			set_style(input4, "width", "90%");
    			attr(div10, "class", "mb-4 mt-4");
    			set_style(div10, "width", "90%");
    			attr(div12, "class", "w-full md:w-3/4 lg:w-2/3 xl:w-1/2 mx-auto bg-white p-8 rounded-xl shadow-lg");
    			set_style(div12, "width", "100%");
    			attr(div13, "class", "container mx-auto px-4");
    			attr(button, "class", "bg-red-500 text-white font-bold py-2 px-4 rounded mt-2");
    			attr(div14, "class", "container mx-auto px-4 flex justify-end");
    			attr(section1, "class", "relative py-16 bg-blueGray-200");
    			attr(section2, "class", "relative pb-16");
    			attr(main, "class", "profile-page");
    		},
    		m(target, anchor) {
    			insert(target, main, anchor);
    			append(main, section0);
    			append(main, t5);
    			append(main, section1);
    			append(section1, div13);
    			append(div13, div12);
    			append(div12, h21);
    			append(div12, t7);
    			append(div12, div11);
    			append(div11, div3);
    			append(div3, input0);
    			set_input_value(input0, /*ideaName*/ ctx[0]);
    			append(div11, t8);
    			append(div11, div4);
    			append(div4, input1);
    			set_input_value(input1, /*ideaSubtitle*/ ctx[1]);
    			append(div11, t9);
    			append(div11, div5);
    			append(div5, textarea0);
    			set_input_value(textarea0, /*ideaAbstract*/ ctx[2]);
    			append(div11, t10);
    			append(div11, div6);
    			append(div6, textarea1);
    			set_input_value(textarea1, /*ideaMessage*/ ctx[3]);
    			append(div11, t11);
    			append(div11, div7);
    			append(div7, input2);
    			set_input_value(input2, /*ideaBannerUrl*/ ctx[4]);
    			append(div11, t12);
    			append(div11, div8);
    			append(div8, input3);
    			set_input_value(input3, /*ideaGithubRepo*/ ctx[5]);
    			append(div11, t13);
    			append(div11, div9);
    			append(div9, input4);
    			set_input_value(input4, /*ideaLightningAddress*/ ctx[6]);
    			append(div11, t14);
    			append(div11, div10);
    			mount_component(multiselectdropdown, div10, null);
    			append(section1, t15);
    			append(section1, div14);
    			append(div14, button);
    			append(div14, t17);
    			mount_component(link, div14, null);
    			append(main, t18);
    			append(main, section2);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen(input0, "input", /*input0_input_handler*/ ctx[10]),
    					listen(input1, "input", /*input1_input_handler*/ ctx[11]),
    					listen(textarea0, "input", /*textarea0_input_handler*/ ctx[12]),
    					listen(textarea0, "input", autoResizeTextarea$1),
    					listen(textarea1, "input", /*textarea1_input_handler*/ ctx[13]),
    					listen(textarea1, "input", autoResizeTextarea$1),
    					listen(input2, "input", /*input2_input_handler*/ ctx[14]),
    					listen(input3, "input", /*input3_input_handler*/ ctx[15]),
    					listen(input4, "input", /*input4_input_handler*/ ctx[16]),
    					listen(button, "click", /*postIdea*/ ctx[9])
    				];

    				mounted = true;
    			}
    		},
    		p(ctx, [dirty]) {
    			if (dirty & /*ideaName*/ 1 && input0.value !== /*ideaName*/ ctx[0]) {
    				set_input_value(input0, /*ideaName*/ ctx[0]);
    			}

    			if (dirty & /*ideaSubtitle*/ 2 && input1.value !== /*ideaSubtitle*/ ctx[1]) {
    				set_input_value(input1, /*ideaSubtitle*/ ctx[1]);
    			}

    			if (dirty & /*ideaAbstract*/ 4) {
    				set_input_value(textarea0, /*ideaAbstract*/ ctx[2]);
    			}

    			if (dirty & /*ideaMessage*/ 8) {
    				set_input_value(textarea1, /*ideaMessage*/ ctx[3]);
    			}

    			if (dirty & /*ideaBannerUrl*/ 16 && input2.value !== /*ideaBannerUrl*/ ctx[4]) {
    				set_input_value(input2, /*ideaBannerUrl*/ ctx[4]);
    			}

    			if (dirty & /*ideaGithubRepo*/ 32 && input3.value !== /*ideaGithubRepo*/ ctx[5]) {
    				set_input_value(input3, /*ideaGithubRepo*/ ctx[5]);
    			}

    			if (dirty & /*ideaLightningAddress*/ 64 && input4.value !== /*ideaLightningAddress*/ ctx[6]) {
    				set_input_value(input4, /*ideaLightningAddress*/ ctx[6]);
    			}

    			const multiselectdropdown_changes = {};

    			if (!updating_selected && dirty & /*selectedCategories*/ 128) {
    				updating_selected = true;
    				multiselectdropdown_changes.selected = /*selectedCategories*/ ctx[7];
    				add_flush_callback(() => updating_selected = false);
    			}

    			multiselectdropdown.$set(multiselectdropdown_changes);
    			const link_changes = {};

    			if (dirty & /*$$scope*/ 262144) {
    				link_changes.$$scope = { dirty, ctx };
    			}

    			link.$set(link_changes);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(multiselectdropdown.$$.fragment, local);
    			transition_in(link.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(multiselectdropdown.$$.fragment, local);
    			transition_out(link.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(main);
    			destroy_component(multiselectdropdown);
    			destroy_component(link);
    			mounted = false;
    			run_all(dispose);
    		}
    	};
    }

    function autoResizeTextarea$1(e) {
    	e.target.style.height = "";
    	e.target.style.height = e.target.scrollHeight + "px";
    }

    function instance$2($$self, $$props, $$invalidate) {
    	onMount(async () => {
    		
    	});

    	let ideaName = "";
    	let ideaSubtitle = "";
    	let ideaAbstract = "";
    	let ideaMessage = "";
    	let ideaBannerUrl = "";
    	let ideaGithubRepo = "";
    	let ideaLightningAddress = "";

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

    	let selectedCategories = [];

    	async function postIdea() {
    		const helper = await NostrHelper.create();
    		await helper.postIdea(ideaName, ideaSubtitle, ideaAbstract, ideaMessage, ideaBannerUrl, ideaGithubRepo, ideaLightningAddress, selectedCategories);
    	}

    	function input0_input_handler() {
    		ideaName = this.value;
    		$$invalidate(0, ideaName);
    	}

    	function input1_input_handler() {
    		ideaSubtitle = this.value;
    		$$invalidate(1, ideaSubtitle);
    	}

    	function textarea0_input_handler() {
    		ideaAbstract = this.value;
    		$$invalidate(2, ideaAbstract);
    	}

    	function textarea1_input_handler() {
    		ideaMessage = this.value;
    		$$invalidate(3, ideaMessage);
    	}

    	function input2_input_handler() {
    		ideaBannerUrl = this.value;
    		$$invalidate(4, ideaBannerUrl);
    	}

    	function input3_input_handler() {
    		ideaGithubRepo = this.value;
    		$$invalidate(5, ideaGithubRepo);
    	}

    	function input4_input_handler() {
    		ideaLightningAddress = this.value;
    		$$invalidate(6, ideaLightningAddress);
    	}

    	function multiselectdropdown_selected_binding(value) {
    		selectedCategories = value;
    		$$invalidate(7, selectedCategories);
    	}

    	return [
    		ideaName,
    		ideaSubtitle,
    		ideaAbstract,
    		ideaMessage,
    		ideaBannerUrl,
    		ideaGithubRepo,
    		ideaLightningAddress,
    		selectedCategories,
    		categories,
    		postIdea,
    		input0_input_handler,
    		input1_input_handler,
    		textarea0_input_handler,
    		textarea1_input_handler,
    		input2_input_handler,
    		input3_input_handler,
    		input4_input_handler,
    		multiselectdropdown_selected_binding
    	];
    }

    class PostIdea extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$2, create_fragment$3, safe_not_equal, {});
    	}
    }

    /* src/views/EditProfileView.svelte generated by Svelte v3.59.1 */

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[23] = list[i];
    	return child_ctx;
    }

    // (160:36) {#if profile && profile.picture}
    function create_if_block$1(ctx) {
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

    // (276:56) {#each relays as relay}
    function create_each_block(ctx) {
    	let div1;
    	let div0;
    	let t0_value = /*relay*/ ctx[23] + "";
    	let t0;
    	let t1;
    	let button;
    	let mounted;
    	let dispose;

    	function click_handler() {
    		return /*click_handler*/ ctx[19](/*relay*/ ctx[23]);
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
    			if (dirty & /*relays*/ 128 && t0_value !== (t0_value = /*relay*/ ctx[23] + "")) set_data(t0, t0_value);
    		},
    		d(detaching) {
    			if (detaching) detach(div1);
    			mounted = false;
    			dispose();
    		}
    	};
    }

    function create_fragment$2(ctx) {
    	let div28;
    	let main;
    	let section0;
    	let div1;
    	let span;
    	let t0;
    	let div0;
    	let h1;
    	let t1;
    	let div1_style_value;
    	let t2;
    	let div2;
    	let t3;
    	let section1;
    	let div27;
    	let div25;
    	let div24;
    	let div5;
    	let div4;
    	let div3;
    	let t4;
    	let div23;
    	let div10;
    	let div9;
    	let label0;
    	let t6;
    	let input0;
    	let t7;
    	let label1;
    	let t9;
    	let textarea;
    	let t10;
    	let div8;
    	let div6;
    	let label2;
    	let t12;
    	let input1;
    	let t13;
    	let div7;
    	let label3;
    	let t15;
    	let input2;
    	let t16;
    	let div22;
    	let div21;
    	let div14;
    	let div13;
    	let div11;
    	let label4;
    	let t18;
    	let input3;
    	let t19;
    	let div12;
    	let label5;
    	let t21;
    	let input4;
    	let t22;
    	let div20;
    	let div19;
    	let div18;
    	let div17;
    	let h2;
    	let t24;
    	let div16;
    	let t25;
    	let div15;
    	let input5;
    	let t26;
    	let button0;
    	let t28;
    	let div26;
    	let button1;
    	let t30;
    	let button2;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block = /*profile*/ ctx[0] && /*profile*/ ctx[0].picture && create_if_block$1(ctx);
    	let each_value = /*relays*/ ctx[7];
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	return {
    		c() {
    			div28 = element("div");
    			main = element("main");
    			section0 = element("section");
    			div1 = element("div");
    			span = element("span");
    			t0 = space();
    			div0 = element("div");
    			h1 = element("h1");
    			t1 = text(/*name*/ ctx[1]);
    			t2 = space();
    			div2 = element("div");
    			div2.innerHTML = `<svg class="absolute bottom-0 overflow-hidden" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" version="1.1" viewBox="0 0 2560 100" x="0" y="0"><polygon class="text-blueGray-200 fill-current" points="2560 0 2560 100 0 100"></polygon></svg>`;
    			t3 = space();
    			section1 = element("section");
    			div27 = element("div");
    			div25 = element("div");
    			div24 = element("div");
    			div5 = element("div");
    			div4 = element("div");
    			div3 = element("div");
    			if (if_block) if_block.c();
    			t4 = space();
    			div23 = element("div");
    			div10 = element("div");
    			div9 = element("div");
    			label0 = element("label");
    			label0.textContent = "Name";
    			t6 = space();
    			input0 = element("input");
    			t7 = space();
    			label1 = element("label");
    			label1.textContent = "About";
    			t9 = space();
    			textarea = element("textarea");
    			t10 = space();
    			div8 = element("div");
    			div6 = element("div");
    			label2 = element("label");
    			label2.textContent = "Github Username";
    			t12 = space();
    			input1 = element("input");
    			t13 = space();
    			div7 = element("div");
    			label3 = element("label");
    			label3.textContent = "Github Proof";
    			t15 = space();
    			input2 = element("input");
    			t16 = space();
    			div22 = element("div");
    			div21 = element("div");
    			div14 = element("div");
    			div13 = element("div");
    			div11 = element("div");
    			label4 = element("label");
    			label4.textContent = "Profile Picture URL";
    			t18 = space();
    			input3 = element("input");
    			t19 = space();
    			div12 = element("div");
    			label5 = element("label");
    			label5.textContent = "Banner URL";
    			t21 = space();
    			input4 = element("input");
    			t22 = space();
    			div20 = element("div");
    			div19 = element("div");
    			div18 = element("div");
    			div17 = element("div");
    			h2 = element("h2");
    			h2.textContent = "Relays";
    			t24 = space();
    			div16 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t25 = space();
    			div15 = element("div");
    			input5 = element("input");
    			t26 = space();
    			button0 = element("button");
    			button0.textContent = "Add";
    			t28 = space();
    			div26 = element("div");
    			button1 = element("button");
    			button1.textContent = "Back";
    			t30 = space();
    			button2 = element("button");
    			button2.textContent = "Update Profile";
    			attr(span, "id", "blackOverlay");
    			attr(span, "class", "w-full h-full absolute opacity-50 bg-black");
    			attr(h1, "class", "text-4xl font-bold text-white");
    			attr(div0, "class", "absolute left-0 right-0 top-1/2 transform -translate-y-1/2 px-4 flex flex-col items-start justify-center h-full");
    			attr(div1, "class", "absolute top-0 w-full h-full bg-center bg-cover");
    			attr(div1, "style", div1_style_value = `background-image: url(${/*banner*/ ctx[4]});`);
    			attr(div2, "class", "top-auto bottom-0 left-0 right-0 w-full absolute pointer-events-none overflow-hidden h-70-px");
    			set_style(div2, "transform", "translateZ(0)");
    			attr(section0, "class", "relative block h-500-px");
    			set_style(div3, "width", "150px");
    			set_style(div3, "height", "150px");
    			set_style(div3, "border-radius", "50%");
    			set_style(div3, "overflow", "hidden");
    			set_style(div3, "position", "relative");
    			set_style(div3, "top", "-75px");
    			attr(div4, "class", "w-full lg:w-3/12 px-4 lg:order-2 flex justify-center");
    			attr(div5, "class", "flex flex-wrap justify-center");
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
    			attr(div8, "class", "flex space-x-4");
    			attr(div9, "class", "mb-2 text-blueGray-600 mt-10 w-full lg:w-9/12 px-4 mx-auto");
    			attr(div10, "class", "text-center mt-12");
    			attr(label4, "for", "picture");
    			attr(label4, "class", "text-lg text-blueGray-400");
    			attr(input3, "id", "picture");
    			attr(input3, "class", "shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-4");
    			attr(div11, "class", "mb-4");
    			attr(label5, "for", "banner");
    			attr(label5, "class", "text-lg text-blueGray-400");
    			attr(input4, "id", "banner");
    			attr(input4, "class", "shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-4");
    			attr(div13, "class", "mt-6");
    			attr(div14, "class", "w-full lg:w-9/12 px-4");
    			attr(h2, "class", "text-lg text-blueGray-400 mb-4");
    			attr(input5, "class", "shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline");
    			attr(input5, "placeholder", "Enter relay URL...");
    			attr(button0, "class", "bg-green-500 text-white font-bold py-2 px-4 rounded ml-2");
    			attr(div15, "class", "flex justify-between items-center mt-4");
    			attr(div16, "class", "flex flex-col gap-2");
    			attr(div17, "class", "mt-6");
    			attr(div18, "class", "w-full lg:w-9/12 px-4");
    			attr(div19, "class", "flex flex-wrap justify-center");
    			attr(div20, "class", "mt-10 py-10 border-t border-blueGray-200 text-center w-full");
    			attr(div21, "class", "flex flex-wrap justify-center");
    			attr(div22, "class", "mt-10 py-10 border-t border-blueGray-200 text-center");
    			attr(div23, "class", "mt-10 px-10");
    			attr(div24, "class", "px-6");
    			attr(div25, "class", "relative flex flex-col min-w-0 break-words bg-white w-full mb-6 shadow-xl rounded-lg -mt-64");
    			attr(button1, "class", "bg-red-500 text-white font-bold py-2 px-4 rounded mr-4");
    			attr(button2, "class", "bg-green-500 text-white font-bold py-2 px-4 rounded");
    			attr(div26, "class", "flex justify-end mt-4 px-10");
    			attr(div27, "class", "container mx-auto px-4");
    			attr(section1, "class", "relative py-16 bg-blueGray-200");
    			attr(main, "class", "profile-page");
    		},
    		m(target, anchor) {
    			insert(target, div28, anchor);
    			append(div28, main);
    			append(main, section0);
    			append(section0, div1);
    			append(div1, span);
    			append(div1, t0);
    			append(div1, div0);
    			append(div0, h1);
    			append(h1, t1);
    			append(section0, t2);
    			append(section0, div2);
    			append(main, t3);
    			append(main, section1);
    			append(section1, div27);
    			append(div27, div25);
    			append(div25, div24);
    			append(div24, div5);
    			append(div5, div4);
    			append(div4, div3);
    			if (if_block) if_block.m(div3, null);
    			append(div24, t4);
    			append(div24, div23);
    			append(div23, div10);
    			append(div10, div9);
    			append(div9, label0);
    			append(div9, t6);
    			append(div9, input0);
    			set_input_value(input0, /*name*/ ctx[1]);
    			append(div9, t7);
    			append(div9, label1);
    			append(div9, t9);
    			append(div9, textarea);
    			set_input_value(textarea, /*dev_about*/ ctx[2]);
    			append(div9, t10);
    			append(div9, div8);
    			append(div8, div6);
    			append(div6, label2);
    			append(div6, t12);
    			append(div6, input1);
    			set_input_value(input1, /*git_username*/ ctx[5]);
    			append(div8, t13);
    			append(div8, div7);
    			append(div7, label3);
    			append(div7, t15);
    			append(div7, input2);
    			set_input_value(input2, /*git_proof*/ ctx[6]);
    			append(div23, t16);
    			append(div23, div22);
    			append(div22, div21);
    			append(div21, div14);
    			append(div14, div13);
    			append(div13, div11);
    			append(div11, label4);
    			append(div11, t18);
    			append(div11, input3);
    			set_input_value(input3, /*picture*/ ctx[3]);
    			append(div13, t19);
    			append(div13, div12);
    			append(div12, label5);
    			append(div12, t21);
    			append(div12, input4);
    			set_input_value(input4, /*banner*/ ctx[4]);
    			append(div21, t22);
    			append(div21, div20);
    			append(div20, div19);
    			append(div19, div18);
    			append(div18, div17);
    			append(div17, h2);
    			append(div17, t24);
    			append(div17, div16);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				if (each_blocks[i]) {
    					each_blocks[i].m(div16, null);
    				}
    			}

    			append(div16, t25);
    			append(div16, div15);
    			append(div15, input5);
    			set_input_value(input5, /*newRelay*/ ctx[8]);
    			append(div15, t26);
    			append(div15, button0);
    			append(div27, t28);
    			append(div27, div26);
    			append(div26, button1);
    			append(div26, t30);
    			append(div26, button2);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen(input0, "input", /*input0_input_handler*/ ctx[13]),
    					listen(textarea, "input", /*textarea_input_handler*/ ctx[14]),
    					listen(textarea, "input", autoResizeTextarea),
    					listen(input1, "input", /*input1_input_handler*/ ctx[15]),
    					listen(input2, "input", /*input2_input_handler*/ ctx[16]),
    					listen(input3, "input", /*input3_input_handler*/ ctx[17]),
    					listen(input4, "input", /*input4_input_handler*/ ctx[18]),
    					listen(input5, "input", /*input5_input_handler*/ ctx[20]),
    					listen(button0, "click", /*addRelay*/ ctx[11]),
    					listen(button1, "click", /*click_handler_1*/ ctx[21]),
    					listen(button2, "click", /*updateProfile*/ ctx[9])
    				];

    				mounted = true;
    			}
    		},
    		p(ctx, [dirty]) {
    			if (!current || dirty & /*name*/ 2) set_data(t1, /*name*/ ctx[1]);

    			if (!current || dirty & /*banner*/ 16 && div1_style_value !== (div1_style_value = `background-image: url(${/*banner*/ ctx[4]});`)) {
    				attr(div1, "style", div1_style_value);
    			}

    			if (/*profile*/ ctx[0] && /*profile*/ ctx[0].picture) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*profile*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$1(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(div3, null);
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

    			if (dirty & /*deleteRelay, relays*/ 1152) {
    				each_value = /*relays*/ ctx[7];
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div16, t25);
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
    			if (detaching) detach(div28);
    			if (if_block) if_block.d();
    			destroy_each(each_blocks, detaching);
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

    function instance$1($$self, $$props, $$invalidate) {
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
    	let nostrHelper = null;

    	onMount(async () => {
    		try {
    			nostrHelper = await NostrHelper.create();
    			$$invalidate(0, profile = await nostrHelper.getProfile(profile_id));

    			if (profile) {
    				$$invalidate(1, name = profile.name);
    				$$invalidate(2, dev_about = profile.dev_about);
    				$$invalidate(3, picture = profile.picture);
    				$$invalidate(4, banner = profile.banner);

    				// Get GitHub username and proof from profile
    				$$invalidate(5, git_username = profile.githubUsername || "");

    				$$invalidate(6, git_proof = profile.githubProof || "");
    				$$invalidate(7, relays = await nostrHelper.clientRelays);
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

    			console.log(updatedIdentities);
    			await nostrHelper.updateProfile(name, picture, banner, dev_about, profile.lnurl, updatedIdentities);
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
    		if ('profile_id' in $$props) $$invalidate(12, profile_id = $$props.profile_id);
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
    		updateProfile,
    		deleteRelay,
    		addRelay,
    		profile_id,
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
    		init(this, options, instance$1, create_fragment$2, safe_not_equal, { profile_id: 12 });
    	}
    }

    /* src/views/ProfileView.svelte generated by Svelte v3.59.1 */

    function create_if_block_1(ctx) {
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
    				dispose = listen(button, "click", /*click_handler*/ ctx[8]);
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

    // (118:36) {#if profile && profile.picture}
    function create_if_block(ctx) {
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

    function create_fragment$1(ctx) {
    	let div15;
    	let main;
    	let section0;
    	let div2;
    	let span;
    	let t0;
    	let div0;
    	let t1;
    	let t2;
    	let div1;
    	let button0;
    	let t3;
    	let a;
    	let i;
    	let a_href_value;
    	let div2_style_value;
    	let t4;
    	let div3;
    	let t5;
    	let section1;
    	let div14;
    	let div12;
    	let t6;
    	let div11;
    	let div6;
    	let div5;
    	let div4;
    	let t7;
    	let div10;
    	let div9;
    	let div8;
    	let div7;
    	let t8;
    	let div13;
    	let button1;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block0 = /*profile_id*/ ctx[0] === /*publicKey*/ ctx[6] && create_if_block_1(ctx);
    	let if_block1 = /*profile*/ ctx[1] && /*profile*/ ctx[1].picture && create_if_block(ctx);

    	return {
    		c() {
    			div15 = element("div");
    			main = element("main");
    			section0 = element("section");
    			div2 = element("div");
    			span = element("span");
    			t0 = space();
    			div0 = element("div");
    			t1 = text(/*name*/ ctx[2]);
    			t2 = space();
    			div1 = element("div");
    			button0 = element("button");
    			button0.innerHTML = `<img src="/img/lightning.png" style="height: 2.5rem; width: 2.5rem;" alt="Support via Bitcoin Lightning"/>`;
    			t3 = space();
    			a = element("a");
    			i = element("i");
    			t4 = space();
    			div3 = element("div");
    			div3.innerHTML = `<svg class="absolute bottom-0 overflow-hidden" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" version="1.1" viewBox="0 0 2560 100" x="0" y="0"><polygon class="text-blueGray-200 fill-current" points="2560 0 2560 100 0 100"></polygon></svg>`;
    			t5 = space();
    			section1 = element("section");
    			div14 = element("div");
    			div12 = element("div");
    			if (if_block0) if_block0.c();
    			t6 = space();
    			div11 = element("div");
    			div6 = element("div");
    			div5 = element("div");
    			div4 = element("div");
    			if (if_block1) if_block1.c();
    			t7 = space();
    			div10 = element("div");
    			div9 = element("div");
    			div8 = element("div");
    			div7 = element("div");
    			t8 = space();
    			div13 = element("div");
    			button1 = element("button");
    			button1.textContent = "Back";
    			attr(span, "id", "blackOverlay");
    			attr(span, "class", "w-full h-full absolute opacity-50 bg-black");
    			attr(div0, "class", "absolute left-0 top-1/2 transform -translate-y-1/2 text-white text-4xl font-bold p-5");
    			set_style(button0, "padding", "0");
    			attr(i, "class", "fab fa-github text-white");
    			set_style(i, "font-size", "2.5rem");
    			attr(a, "href", a_href_value = "https://www.github.com/" + /*ghUser*/ ctx[5]);
    			attr(a, "target", "_blank");
    			attr(div1, "class", "absolute top-4 right-4 text-3xl text-white flex justify-end items-center gap-6");
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
    			attr(div7, "class", "text-lg leading-relaxed mt-4 mb-20 text-blueGray-700 whitespace-pre-line");
    			attr(div8, "class", "w-full lg:w-9/12 px-4");
    			attr(div9, "class", "flex flex-wrap justify-center");
    			attr(div10, "class", "mt-10 py-10 border-t border-blueGray-200 text-center");
    			attr(div11, "class", "px-6");
    			attr(div12, "class", "relative flex flex-col min-w-0 break-words bg-white w-full mb-6 shadow-xl rounded-lg -mt-64");
    			attr(button1, "class", "bg-red-500 text-white font-bold py-2 px-4 rounded mr-4");
    			attr(div13, "class", "flex justify-end mt-0");
    			attr(div14, "class", "container mx-auto px-4");
    			attr(section1, "class", "relative py-16 bg-blueGray-200");
    			attr(main, "class", "profile-page");
    		},
    		m(target, anchor) {
    			insert(target, div15, anchor);
    			append(div15, main);
    			append(main, section0);
    			append(section0, div2);
    			append(div2, span);
    			append(div2, t0);
    			append(div2, div0);
    			append(div0, t1);
    			append(div2, t2);
    			append(div2, div1);
    			append(div1, button0);
    			append(div1, t3);
    			append(div1, a);
    			append(a, i);
    			append(section0, t4);
    			append(section0, div3);
    			append(main, t5);
    			append(main, section1);
    			append(section1, div14);
    			append(div14, div12);
    			if (if_block0) if_block0.m(div12, null);
    			append(div12, t6);
    			append(div12, div11);
    			append(div11, div6);
    			append(div6, div5);
    			append(div5, div4);
    			if (if_block1) if_block1.m(div4, null);
    			append(div11, t7);
    			append(div11, div10);
    			append(div10, div9);
    			append(div9, div8);
    			append(div8, div7);
    			div7.innerHTML = /*about*/ ctx[3];
    			append(div14, t8);
    			append(div14, div13);
    			append(div13, button1);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen(button0, "click", /*supportIdea*/ ctx[7]),
    					listen(button1, "click", /*click_handler_1*/ ctx[9])
    				];

    				mounted = true;
    			}
    		},
    		p(ctx, [dirty]) {
    			if (!current || dirty & /*name*/ 4) set_data(t1, /*name*/ ctx[2]);

    			if (!current || dirty & /*ghUser*/ 32 && a_href_value !== (a_href_value = "https://www.github.com/" + /*ghUser*/ ctx[5])) {
    				attr(a, "href", a_href_value);
    			}

    			if (!current || dirty & /*banner*/ 16 && div2_style_value !== (div2_style_value = `background-image: url(${/*banner*/ ctx[4]});`)) {
    				attr(div2, "style", div2_style_value);
    			}

    			if (/*profile_id*/ ctx[0] === /*publicKey*/ ctx[6]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_1(ctx);
    					if_block0.c();
    					if_block0.m(div12, t6);
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
    					if_block1 = create_if_block(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(div4, null);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}

    			if (!current || dirty & /*about*/ 8) div7.innerHTML = /*about*/ ctx[3];		},
    		i(local) {
    			if (current) return;
    			transition_in(if_block1);
    			current = true;
    		},
    		o(local) {
    			transition_out(if_block1);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(div15);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};
    }

    function instance($$self, $$props, $$invalidate) {
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
    			const nostrHelper = await NostrHelper.create();
    			$$invalidate(6, publicKey = nostrHelper.publicKey);
    			console.log(profile_id);
    			console.log(publicKey);
    			$$invalidate(1, profile = await nostrHelper.getProfile(profile_id));

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

    	const click_handler = () => navigate(`/edit_profile/${publicKey}`);
    	const click_handler_1 = () => window.history.back();

    	$$self.$$set = $$props => {
    		if ('profile_id' in $$props) $$invalidate(0, profile_id = $$props.profile_id);
    	};

    	return [
    		profile_id,
    		profile,
    		name,
    		about,
    		banner,
    		ghUser,
    		publicKey,
    		supportIdea,
    		click_handler,
    		click_handler_1
    	];
    }

    class ProfileView extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance, create_fragment$1, safe_not_equal, { profile_id: 0 });
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
    	let current;

    	route0 = new Route({
    			props: { path: "/", component: Overview }
    		});

    	route1 = new Route({
    			props: {
    				path: "/overview/:category",
    				component: Overview
    			}
    		});

    	route2 = new Route({
    			props: { path: "/idea/:id", component: IdeaDetail }
    		});

    	route3 = new Route({
    			props: { path: "/postidea", component: PostIdea }
    		});

    	route4 = new Route({
    			props: {
    				path: "/edit_profile/:profile_id",
    				component: EditProfileView
    			}
    		});

    	route5 = new Route({
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
    			current = true;
    		},
    		o(local) {
    			transition_out(route0.$$.fragment, local);
    			transition_out(route1.$$.fragment, local);
    			transition_out(route2.$$.fragment, local);
    			transition_out(route3.$$.fragment, local);
    			transition_out(route4.$$.fragment, local);
    			transition_out(route5.$$.fragment, local);
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
