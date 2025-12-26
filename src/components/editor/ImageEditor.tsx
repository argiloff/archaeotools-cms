import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import ImageEditor from 'tui-image-editor';
import 'tui-image-editor/dist/tui-image-editor.css';

const darkTheme = {
  'common.bi.image': '',
  'common.bisize.width': '0',
  'common.bisize.height': '0',
  'common.backgroundImage': 'none',
  'common.backgroundColor': '#1e1e1e',
  'common.border': '0px',

  'header.backgroundImage': 'none',
  'header.backgroundColor': 'transparent',
  'header.border': '0px',

  'menu.normalIcon.color': '#8a8a8a',
  'menu.activeIcon.color': '#fff',
  'menu.disabledIcon.color': '#434343',
  'menu.hoverIcon.color': '#fff',
  'menu.iconSize.width': '24px',
  'menu.iconSize.height': '24px',

  'submenu.backgroundColor': '#1e1e1e',
  'submenu.partition.color': '#3c3c3c',
  'submenu.normalIcon.color': '#8a8a8a',
  'submenu.activeIcon.color': '#fff',
  'submenu.iconSize.width': '32px',
  'submenu.iconSize.height': '32px',

  'submenu.normalLabel.color': '#8a8a8a',
  'submenu.normalLabel.fontWeight': 'lighter',
  'submenu.activeLabel.color': '#fff',
  'submenu.activeLabel.fontWeight': 'lighter',

  'checkbox.border': '1px solid #3c3c3c',
  'checkbox.backgroundColor': '#1e1e1e',

  'range.pointer.color': '#fff',
  'range.bar.color': '#666',
  'range.subbar.color': '#d1d1d1',
  'range.disabledPointer.color': '#414141',
  'range.disabledBar.color': '#282828',
  'range.disabledSubbar.color': '#414141',
  'range.value.color': '#fff',
  'range.value.fontWeight': 'lighter',
  'range.value.fontSize': '11px',
  'range.value.border': '1px solid #353535',
  'range.value.backgroundColor': '#1e1e1e',
  'range.title.color': '#fff',
  'range.title.fontWeight': 'lighter',

  'colorpicker.button.border': '1px solid #1e1e1e',
  'colorpicker.title.color': '#fff',
};

export interface ImageEditorHandle {
  getImageData: () => string | null;
  resetEditor: () => void;
}

interface Props {
  imageUrl?: string;
  onReady?: () => void;
}

export const TuiImageEditor = forwardRef<ImageEditorHandle, Props>(({ imageUrl, onReady }, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<ImageEditor | null>(null);

  useImperativeHandle(ref, () => ({
    getImageData: () => {
      if (!editorRef.current) return null;
      return editorRef.current.toDataURL();
    },
    resetEditor: () => {
      if (editorRef.current) {
        editorRef.current.clearObjects();
        editorRef.current.clearUndoStack();
        editorRef.current.clearRedoStack();
      }
    },
  }));

  useEffect(() => {
    if (!containerRef.current) return;

    const editor = new ImageEditor(containerRef.current, {
      includeUI: {
        loadImage: imageUrl ? { path: imageUrl, name: 'photo' } : undefined,
        theme: darkTheme,
        menu: ['crop', 'flip', 'rotate', 'draw', 'shape', 'icon', 'text', 'filter'],
        initMenu: 'filter',
        uiSize: {
          width: '100%',
          height: '100%',
        },
        menuBarPosition: 'bottom',
      },
      cssMaxWidth: 1200,
      cssMaxHeight: 800,
      usageStatistics: false,
    });

    editorRef.current = editor;
    onReady?.();

    return () => {
      editor.destroy();
      editorRef.current = null;
    };
  }, [imageUrl, onReady]);

  return <div ref={containerRef} className="tui-editor-container" />;
});

TuiImageEditor.displayName = 'TuiImageEditor';
