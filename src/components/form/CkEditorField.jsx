import PropTypes from "prop-types";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { uploadImage } from "@/services/api/uploadApi";

function CkEditorField({ value = "", onChange }) {

  // --- 1. Định nghĩa Adapter tùy chỉnh ---
  function MyUploadAdapter(loader) {
    return {
      upload: () => {
        return new Promise((resolve, reject) => {
          // 'loader.file' là một Promise trong CKEditor 5
          loader.file.then((file) => {
            // Gọi API uploadImage của dự án (đã có Token trong http service)
            uploadImage(file)
              .then((data) => {
                // Backend trả về: { secure_url: "...", public_id: "..." }
                // CKEditor cần: { default: "url_anh" }
                resolve({
                  default: data.secure_url, 
                });
              })
              .catch((err) => {
                console.error("Upload failed:", err);
                reject(err);
              });
          });
        });
      },
    };
  }

  // --- 2. Plugin để gắn Adapter vào Editor ---
  function UploadAdapterPlugin(editor) {
    editor.plugins.get("FileRepository").createUploadAdapter = (loader) => {
      return MyUploadAdapter(loader);
    };
  }

  // --- 3. Cấu hình Editor ---
  const editorConfig = {
    language: "vi",
    extraPlugins: [UploadAdapterPlugin], // Kích hoạt plugin upload
    toolbar: {
      items: [
        "undo", "redo", "|",
        "heading", "|",
        "fontfamily", "fontsize", "fontColor", "fontBackgroundColor", "|",
        "bold", "italic", "strikethrough", "subscript", "superscript", "code", "|",
        "link", "uploadImage", "blockQuote", "codeBlock", "|", // Nút uploadImage
        "alignment", "|",
        "bulletedList", "numberedList", "todoList", "outdent", "indent",
      ],
      shouldNotGroupWhenFull: true,
    },
    // Tùy chỉnh hiển thị ảnh trong bài viết (optional)
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