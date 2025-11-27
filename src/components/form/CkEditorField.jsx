// src/components/form/CkEditorField.jsx
import PropTypes from "prop-types";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";

function CkEditorField({ value = "", onChange }) {
  const editorConfig = {
    language: "vi", // 👈 đặt ngôn ngữ là tiếng Việt
    toolbar: {
	items: [
		'undo', 'redo',
		'|',
		'heading',
		'|',
		'fontfamily', 'fontsize', 'fontColor', 'fontBackgroundColor',
		'|',
		'bold', 'italic', 'strikethrough', 'subscript', 'superscript', 'code',
		'|',
		'link', 'uploadImage', 'blockQuote', 'codeBlock',
		'|',
		'alignment',
		'|',
		'bulletedList', 'numberedList', 'todoList', 'outdent', 'indent'
	],
	shouldNotGroupWhenFull: true
}


  };

  return (
    <div className="ck-editor-wrapper">
      <CKEditor
        editor={ClassicEditor}
        data={value || ""}
        config={editorConfig}
        onChange={(_, editor) => {
          const data = editor.getData();
          if (onChange) onChange(data);
        }}
      />
    </div>
  );
}

CkEditorField.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func,
};

export default CkEditorField;
