import React from 'react';
import {
  SortableContainer,
  sortableHandle,
  SortableElement,
  arrayMove,
} from 'react-sortable-hoc';
import FoldIcon from './foldIcon';
import DescriptionList, { getDescription } from './descriptionList';

const DragHandle = sortableHandle(() => (
  <span className="fr-move-icon">:::</span>
));

const listItemHoc = ButtonComponent =>
  class extends React.Component {
    componentDidMount() {
      const { p = {}, name, fold } = this.props;
      const description = getDescription({
        schema: p.schema,
        value: p.value,
        index: name,
      });
      // 如果第一个值不为空，则收起
      // 新增的值为0，不折叠
      const hasValue = description && description[0] && description[0].text;
      if (hasValue && fold !== 0) {
        this.props.toggleFoldItem(name);
      }
    }

    toggleFold = () => {
      this.props.toggleFoldItem(this.props.name);
    };

    render() {
      const { item, p = {}, name, fold } = this.props;
      const descProps = { ...p, index: name };
      const { options = {} } = p;
      const { foldable: canFold, hideDelete } = options;
      // 只有当items为object时才做收起（fold）处理
      const isObj = p.schema.items && p.schema.items.type == 'object';
      let setClass =
        'fr-set ba b--black-10 hover-b--black-20 relative flex flex-column';
      if (canFold && fold) {
        setClass += ' pv12';
      } else if (p.displayType === 'row') {
        setClass += ' pt44';
      }
      return (
        <li className={setClass}>
          {canFold && fold && isObj ? <DescriptionList {...descProps} /> : item}
          {canFold && (
            <FoldIcon
              fold={fold}
              onClick={this.toggleFold}
              style={{ position: 'absolute', top: 12, right: 36 }}
            />
          )}
          <DragHandle />
          {!((canFold && fold) || hideDelete) && (
            <ButtonComponent
              className="self-end"
              type="dashed"
              icon="delete"
              onClick={() => {
                const value = [...p.value];
                value.splice(name, 1);
                p.onChange(p.name, value);
              }}
            >
              删除
            </ButtonComponent>
          )}
        </li>
      );
    }
  };

const fieldListHoc = ButtonComponent => {
  const SortableItem = SortableElement(listItemHoc(ButtonComponent));
  return class extends React.Component {
    handleAddClick = () => {
      const { p, addUnfoldItem } = this.props;
      const value = [...p.value];
      value.push(p.newItem);
      p.onChange(p.name, value);
      addUnfoldItem();
    };

    render() {
      const { p, foldList = [], toggleFoldItem } = this.props;
      const list = p.value || [];
      return (
        <ul className="pl0 ma0">
          {list.map((_, name) => (
            <SortableItem
              key={`item-${name}`}
              index={name}
              name={name}
              p={p}
              fold={foldList[name]}
              toggleFoldItem={toggleFoldItem}
              item={p.getSubField({
                name,
                value: p.value[name],
                onChange(key, val) {
                  const value = [...p.value];
                  value[key] = val;
                  p.onChange(p.name, value);
                },
              })}
            />
          ))}
          <div className="tr">
            <ButtonComponent icon="file-add" onClick={this.handleAddClick}>
              新增
            </ButtonComponent>
            {p.extrafrButtons &&
              p.extrafrButtons.length > 0 &&
              p.extrafrButtons.map(item => (
                <ButtonComponent
                  className="ml2"
                  icon={item.icon}
                  onClick={() => {
                    if (item.callback === 'clearAll') {
                      p.onChange(p.name, []);
                      return;
                    }
                    if (item.callback === 'copyLast') {
                      const value = [...p.value];
                      const lastIndex = value.length - 1;
                      value.push(lastIndex > -1 ? value[lastIndex] : p.newItem);
                      p.onChange(p.name, value);
                      return;
                    }
                    if (typeof window[item.callback] === 'function') {
                      window[item.callback].call(); // eslint-disable-line
                    }
                  }}
                >
                  {item.text}
                </ButtonComponent>
              ))}
          </div>
        </ul>
      );
    }
  };
};

export default function listHoc(ButtonComponent) {
  const SortableList = SortableContainer(fieldListHoc(ButtonComponent));
  return class extends React.Component {
    static propTypes = {
      value: PropTypes.array,
    };

    static defaultProps = {
      value: [],
    };

    constructor(props) {
      super(props);
      const len = this.props.value.length || 0;
      this.state = {
        foldList: new Array(len).fill(false) || [],
      };
    }

    // 新添加的item默认是展开的
    addUnfoldItem = () =>
      this.setState({
        foldList: [...this.state.foldList, 0],
      });

    toggleFoldItem = index => {
      const { foldList = [] } = this.state;
      foldList[index] = !foldList[index]; // TODO: need better solution for the weird behavior caused by setState being async
      this.setState({
        foldList,
      });
    };

    handleSort = ({ oldIndex, newIndex }) => {
      const { onChange, name, value } = this.props;
      onChange(name, arrayMove(value, oldIndex, newIndex));
      this.setState({
        foldList: arrayMove(this.state.foldList, oldIndex, newIndex),
      });
    };

    render() {
      const { foldList } = this.state;
      return (
        <SortableList
          p={this.props}
          foldList={foldList}
          toggleFoldItem={this.toggleFoldItem}
          addUnfoldItem={this.addUnfoldItem}
          distance={6}
          useDragHandle
          helperClass="fr-sort-help-class"
          shouldCancelStart={e =>
            e.toElement && e.toElement.className === 'fr-tooltip-container'
          }
          onSortEnd={this.handleSort}
        />
      );
    }
  };
}
