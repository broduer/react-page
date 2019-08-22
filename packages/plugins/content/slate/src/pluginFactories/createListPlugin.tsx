import { CustomizeFunction } from './createComponentPlugin';
import createSlateEditList from '@guestbell/slate-edit-list';

import createListItemPlugin from './createListItemPlugin';
import createSimpleHtmlBlockPlugin, {
  HtmlBlockData
} from './createSimpleHtmlBlockPlugin';

type ListDef = {
  type: string;
  icon?: JSX.Element;
  hotKey?: string;
  tagName: string;
  noButton?: boolean; // for Li, this is automatically
  listItem: {
    type: string;
    tagName: string;
    defaultNode: string;
  };
};

function createListPlugin<T = {}>(def: ListDef) {
  const slateEditList = createSlateEditList({
    typeItem: def.listItem.type,
    types: [def.type],
  });

  return function<CT extends {}>(customizers?: {
    customizeList?: CustomizeFunction<HtmlBlockData<T>, HtmlBlockData<T & CT>>;
    customizeListItem?: CustomizeFunction<
      HtmlBlockData<T>,
      HtmlBlockData<T & CT>
    >;
  }) {
    return [
      createSimpleHtmlBlockPlugin({
        type: def.type,
        icon: def.icon,
        noButton: def.noButton,
        tagName: def.tagName,
        customAdd: editor => slateEditList.changes.wrapInList(editor, def.type),
        customRemove: editor => slateEditList.changes.unwrapList(editor),
      })(customizers && customizers.customizeList),
      createListItemPlugin(def.listItem)(
        customizers && customizers.customizeListItem
      ),
      {
        onKeyDown: slateEditList.onKeyDown,
      },
    ];
  };
}

const list = createListPlugin({
  type: 'foo',
  tagName: 'ul',
  listItem: {
    type: 'asdf',
    tagName: 'li',
    defaultNode: 'paragraph',
  },
});

list<{ foo?: string }>({
  customizeList: def => ({
    ...def,
    Component: props => {
      props.data.get('foo');
      return null;
    },
  }),
});

export default createListPlugin;