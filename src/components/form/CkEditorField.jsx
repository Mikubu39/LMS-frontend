// ✅ src/components/CkEditorField.jsx
import PropTypes from "prop-types";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { uploadImage } from "@/services/api/uploadApi";

function CkEditorField({ value = "", onChange }) {

  function MyUploadAdapter(loader) {
    return {
      upload: () => {
        return new Promise((resolve, reject) => {
          loader.file.then((file) => {
            uploadImage(file)
              .then((data) => {
                resolve({ default: data.secure_url });
              })
              .catch((err) => {
                reject(err);
              });
          });
        });
      },
    };
  }

  function UploadAdapterPlugin(editor) {
    editor.plugins.get("FileRepository").createUploadAdapter = (loader) => {
      return MyUploadAdapter(loader);
    };
  }

  const editorConfig = {
    language: "vi",
    extraPlugins: [UploadAdapterPlugin],
    // 👇 THÊM DÒNG NÀY: Tắt tính năng tự động định dạng và biến đổi ký tự
    removePlugins: ["Autoformat", "TextTransformation"], 
    
    toolbar: {
      items: [
        "undo", "redo", "|",
        "heading", "|",
        "fontfamily", "fontsize", "fontColor", "fontBackgroundColor", "|",
        "bold", "italic", "strikethrough", "subscript", "superscript", "code", "|",
        "link", "uploadImage", "blockQuote", "codeBlock", "|",
        "alignment", "|",
        "bulletedList", "numberedList", "todoList", "outdent", "indent",
      ],
      shouldNotGroupWhenFull: true,
    },
    image: {
      toolbar: [
        "imageTextAlternative",
        "toggleImageCaption",
        "imageStyle:inline",
        "imageStyle:block",
        "imageStyle:side",
      ],
    },
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