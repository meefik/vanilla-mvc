import css from 'todomvc-app-css/index.css';
import { Component } from 'libux';
import { getItem, setItem } from 'store';
import t from 'locale';

export default class TodoView extends Component {
  constructor(...args) {
    super(...args);
    this.mount(this.params.el || document.body);
  }
  template() {
    return `
    <section class="${css.todoapp}">
			<header>
				<h1>${t('header')}</h1>
				<input class="${css['new-todo']}" placeholder="${t('new_todo')}" autofocus>
			</header>
			<section class="${css.main} <%- state.todo.length?'':'${css.hidden}' %>">
				<input id="toggle-all" class="${css['toggle-all']}" type="checkbox">
				<label for="toggle-all">${t('toggle_all')}</label>
				<ul class="${css['todo-list']}">
          <% state.todo.forEach(function(item, index) { %>
            <li data-index="<%- index %>"
              class="<%= item.completed?'${css.completed}':'' %>
              <%= item.editing?'${css.editing}':'' %>
              <%= item.hidden?'${css.hidden}':'' %>"
            >
            <div class="${css.view}">
            	<input class="${css.toggle}"
                type="checkbox" <%= item.completed?'checked':'' %>>
            	<label><%- item.text %></label>
            	<button class="${css.destroy}"></button>
            </div>
            <% if (item.editing) { %>
              <input class="${css.edit}" value="<%- item.text %>">
            <% } %>
            </li>
          <% }); %>
        </ul>
				<footer class="${css.footer}">
					<span class="${css['todo-count']}">
            <%- state.todo.filter(item => !item.completed).length %>
          </span>
					<ul class="${css.filters}">
          <li><a href="#/"
          class="<%- !this.params.filter?'${css.selected}':'' %>">
            ${t('filter.all')}
          </a></li>
          <li><a href="#/?filter=active"
          class="<%- this.params.filter==='active'?'${css.selected}':'' %>">
            ${t('filter.active')}
          </a></li>
          <li><a href="#/?filter=completed"
          class="<%- this.params.filter==='completed'?'${css.selected}':'' %>">
            ${t('filter.completed')}
          </a></li>
          </ul>
					<button class="${css['clear-completed']}">${t('clear_completed')}</button>
				</footer>
			</section>
		</section>
		<footer class="${css.info}">
			<p>${t('info.line1')}</p>
			<p>${t('info.line2')}</p>
		</footer>
    `;
  }
  data() {
    return {
      todo: getItem('todo') || []
    };
  }
  events() {
    return {
      changed() {
        const filter = this.params.filter;
        this.update({
          todo: this.clone('todo').filter(item => {
            item.hidden =
              (!item.completed && filter === 'completed') ||
              (item.completed && filter === 'active');
            return item;
          })
        });
      },
      updated() {
        setItem('todo', this.state.todo);
        this.render();
      },
      keypress: e => {
        if (e.key !== 'Enter') return;
        const text = e.target.value;
        if (text) {
          const todo = this.clone('todo');
          todo.push({ text });
          this.update({ todo });
        }
      },
      click: e => {
        const target = e.target;
        switch (target.className) {
        case css['destroy']: {
          const { index } = this.locate('li[data-index]', e).dataset;
          return this.delete(`todo.${index}`);
        }
        case css['toggle']: {
          const { index } = this.locate('li[data-index]', e).dataset;
          return this.update(`todo.${index}.completed`, target.checked);
        }
        case css['toggle-all']: {
          const el = this.locate('li[data-index]', e);
          return this.update({
            todo: this.clone('todo').map(item => {
              item.completed = el.checked;
              return item;
            })
          });
        }
        case css['clear-completed']: {
          return this.update({
            todo: this.clone('todo').filter(item => !item.completed)
          });
        }
        }
      },
      dblclick: e => {
        const el = this.locate('li[data-index]', e);
        if (!el) return;
        const idx = el.dataset.index;
        const todo = this.clone('todo');
        const item = todo[idx];
        if (!item.completed) item.editing = true;
        this.update({ todo });
        const edit = this.$(css.edit);
        if (edit) edit.focus();
      },
      blur: e => {
        const input = this.locate(`.${css.edit}`, e);
        if (!input) return;
        const { index } = this.locate('li[data-index]', e).dataset;
        if (!input.value) this.delete(`todo.${index}`);
        else this.update(`todo.${index}`, { text: input.value });
      }
    };
  }
}
