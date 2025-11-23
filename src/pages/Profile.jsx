// src/pages/Profile.jsx
import { useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { selectUser, setUser } from "@/redux/authSlice";
import {
  getProfile,
  updateProfile,
  mapProfileToUser,
} from "@/services/api/profileApi.jsx";
import { uploadImage } from "@/services/api/uploadApi.jsx"; // 👈 THÊM: dùng API upload

import "../css/profile.css";

// Icon camera / upload trên avatar (SVG 60x60)
const AvatarUploadIcon = () => (
  <svg
    className="pf-avatar-upload-icon"
    width="60"
    height="60"
    viewBox="0 0 60 60"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect width="60" height="60" rx="30" fill="white" />
    <path
      d="M39.9996 20.0002C38.983 20.0002 38.0496 19.4168 37.583 18.5168L36.383 16.1002C35.6163 14.5835 33.6163 13.3335 31.9163 13.3335H28.0996C26.383 13.3335 24.383 14.5835 23.6163 16.1002L22.4163 18.5168C21.9496 19.4168 21.0163 20.0002 19.9996 20.0002C16.383 20.0002 13.5163 23.0502 13.7496 26.6502L14.6163 40.4168C14.8163 43.8502 16.6663 46.6668 21.2663 46.6668H38.733C43.333 46.6668 45.1663 43.8502 45.383 40.4168L46.2496 26.6502C46.483 23.0502 43.6163 20.0002 39.9996 20.0002ZM27.4996 22.0835H32.4996C33.183 22.0835 33.7496 22.6502 33.7496 23.3335C33.7496 24.0168 33.183 24.5835 32.4996 24.5835H27.4996C26.8163 24.5835 26.2496 24.0168 26.2496 23.3335C26.2496 22.6502 26.8163 22.0835 27.4996 22.0835ZM29.9996 40.2002C26.8996 40.2002 24.3663 37.6835 24.3663 34.5668C24.3663 31.4502 26.883 28.9335 29.9996 28.9335C33.1163 28.9335 35.633 31.4502 35.633 34.5668C35.633 37.6835 33.0996 40.2002 29.9996 40.2002Z"
      fill="#848484"
    />
  </svg>
);

// Icon khóa nhỏ trên nút "Đổi mật khẩu" (SVG 20x20)
const LockIcon = () => (
  <svg
    className="pf-change-pass-icon"
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M5 8.33317V6.6665C5 3.90817 5.83333 1.6665 10 1.6665C14.1667 1.6665 15 3.90817 15 6.6665V8.33317"
      stroke="#DD673C"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M10.0003 15.4167C11.1509 15.4167 12.0837 14.4839 12.0837 13.3333C12.0837 12.1827 11.1509 11.25 10.0003 11.25C8.84973 11.25 7.91699 12.1827 7.91699 13.3333C7.91699 14.4839 8.84973 15.4167 10.0003 15.4167Z"
      stroke="#DD673C"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M14.167 18.3335H5.83366C2.50033 18.3335 1.66699 17.5002 1.66699 14.1668V12.5002C1.66699 9.16683 2.50033 8.3335 5.83366 8.3335H14.167C17.5003 8.3335 18.3337 9.16683 18.3337 12.5002V14.1668C18.3337 17.5002 17.5003 18.3335 14.167 18.3335Z"
      stroke="#DD673C"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const DEFAULT_AVATAR =
  "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg";

export default function Profile() {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);

  const [avatarUrl, setAvatarUrl] = useState(user?.avatar || DEFAULT_AVATAR);

  // state form
  const [lastName, setLastName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState(""); // cho phép sửa trên UI
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [studentCode, setStudentCode] = useState(""); // chỉ hiển thị

  const [uploading, setUploading] = useState(false);
  const [savingInfo, setSavingInfo] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [error, setError] = useState("");
  const [infoMessage, setInfoMessage] = useState("");
  const [loadingProfile, setLoadingProfile] = useState(false);

  const fileInputRef = useRef(null);

  // ====== Map lỗi backend -> message tiếng Việt gọn ======
  const mapErrorMessage = (err) => {
    const res = err?.response;
    if (!res) return err?.message || "Đã xảy ra lỗi không xác định.";

    const data = res.data;
    if (typeof data?.message === "string") return data.message;
    if (Array.isArray(data?.message)) return data.message.join(", ");
    return err?.message || "Đã xảy ra lỗi trên máy chủ.";
  };

  // ========== GỌI API lấy profile KHI VÀO TRANG ==========
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoadingProfile(true);
        setError("");
        setInfoMessage("");

        const mappedUser = await getProfile({ mapped: true });

        dispatch(setUser(mappedUser));
        setAvatarUrl(mappedUser.avatar || DEFAULT_AVATAR);
      } catch (err) {
        console.error("Fetch profile error:", err);
        setError(mapErrorMessage(err));
      } finally {
        setLoadingProfile(false);
      }
    };

    fetchProfile();
  }, [dispatch]);

  // sync user -> form khi Redux đã có dữ liệu
  useEffect(() => {
    const full_name = user?.name || user?.full_name || "Nguyễn Ánh Viên";

    const parts = full_name.trim().split(" ").filter(Boolean);
    const fName = parts.length > 1 ? parts.slice(-1).join(" ") : full_name;
    const lName = parts.length > 1 ? parts.slice(0, -1).join(" ") : "Nguyễn";

    setLastName(lName);
    setFirstName(fName);
    setPhone(user?.phone || "");
    setEmail(user?.email || "");
    setStudentCode(user?.studentCode || user?.user_id || "PT2432");
    setAvatarUrl(user?.avatar || DEFAULT_AVATAR);
    setDateOfBirth(user?.dateOfBirth || user?.dob || "");
    setDirty(false);
  }, [user]);

  const handleClickAvatarButton = () => {
    if (uploading) return;
    fileInputRef.current?.click();
  };

  // ========== Upload avatar ==========
//   const handleFileChange = async (e) => {
//     const file = e.target.files?.[0];
//     if (!file) return;
//     e.target.value = "";

//     if (!file.type.startsWith("image/")) {
//       setError("File phải là hình ảnh (PNG/JPG).");
//       return;
//     }
//     if (file.size > 5 * 1024 * 1024) {
//       setError("Kích thước ảnh tối đa 5MB.");
//       return;
//     }

//     setError("");
//     setInfoMessage("");
//     setUploading(true);

//     try {
//       // Dùng API helper: upload ảnh -> PUT /students/profile { avatar }
//       const { profile } = await uploadAvatarAndUpdateProfile(file);

//       const newUser = mapProfileToUser(profile, user);
//       dispatch(setUser(newUser));
//       setAvatarUrl(newUser.avatar);
//       setInfoMessage("Đã cập nhật ảnh đại diện.");
//     } catch (err) {
//       console.error("Upload avatar error:", err);
//       setError(mapErrorMessage(err));
//     } finally {
//       setUploading(false);
//     }
//   };

  // ✅ BẢN MỚI: upload lên /upload/image rồi PATCH /users/profile/me
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";

    if (!file.type.startsWith("image/")) {
      setError("File phải là hình ảnh (PNG/JPG/WebP).");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Kích thước ảnh tối đa 5MB.");
      return;
    }

    setError("");
    setInfoMessage("");
    setUploading(true);

    try {
      // 1) Upload file lên backend: POST /upload/image (field: "file")
      const uploadRes = await uploadImage(file);
      console.log("[Profile] uploadRes:", uploadRes);

      const imageUrl =
        uploadRes?.secure_url ||
        uploadRes?.url ||
        uploadRes?.avatar ||
        uploadRes?.imageUrl;

      if (!imageUrl) {
        throw new Error("Không lấy được URL ảnh sau khi upload.");
      }

      // 2) Cập nhật profile với avatar mới
      const updatedProfile = await updateProfile({ avatar: imageUrl });
      const newUser = mapProfileToUser(updatedProfile, user);

      dispatch(setUser(newUser));
      setAvatarUrl(newUser.avatar || imageUrl);
      setInfoMessage("Đã cập nhật ảnh đại diện.");
    } catch (err) {
      console.error("Upload avatar error:", err);
      setError(mapErrorMessage(err));
    } finally {
      setUploading(false);
    }
  };

  // ========== Auto-save thông tin cá nhân ==========
  const autoSaveProfile = async () => {
    if (!dirty) return;

    setSavingInfo(true);
    setError("");
    setInfoMessage("");

    try {
      const full_name = `${lastName} ${firstName}`.trim();

      // Chuẩn hóa số điện thoại: bỏ mọi ký tự không phải số
      const cleanedPhone = (phone || "").replace(/\D/g, "");

      // Nếu có nhập phone nhưng quá ngắn thì báo lỗi, không gọi API
      if (cleanedPhone && cleanedPhone.length < 9) {
        setSavingInfo(false);
        setError("Số điện thoại không hợp lệ, vui lòng nhập ít nhất 9 chữ số.");
        return;
      }

      if (cleanedPhone !== phone) {
        setPhone(cleanedPhone);
      }

      // Gửi các field đúng với UpdateProfileDto (full_name, phone, email, dateOfBirth, ...)
      const payload = {
        full_name,
        phone: cleanedPhone || undefined,
        email: email || undefined,
        dateOfBirth: dateOfBirth || undefined,
      };

      console.log("PATCH /users/profile/me payload:", payload);

      const updatedProfile = await updateProfile(payload);
      const newUser = mapProfileToUser(updatedProfile, user);

      dispatch(setUser(newUser));
      setDirty(false);
      setInfoMessage("Đã tự động lưu thông tin.");
      setError("");
    } catch (err) {
      console.error("Auto-save profile error:", err);
      setError(mapErrorMessage(err));
    } finally {
      setSavingInfo(false);
    }
  };

  const handleLastNameChange = (e) => {
    setLastName(e.target.value);
    setDirty(true);
  };

  const handleFirstNameChange = (e) => {
    setFirstName(e.target.value);
    setDirty(true);
  };

  const handlePhoneChange = (e) => {
    setPhone(e.target.value);
    setDirty(true);
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    setDirty(true);
  };

  const handleDobChange = (e) => {
    setDateOfBirth(e.target.value);
    setDirty(true);
  };

  return (
    <div className="pf-page">
      <div className="pf-container">
        {/* --- Header text --- */}
        <div className="pf-header-row">
          <div>
            <h1 className="pf-title">Chỉnh sửa thông tin</h1>
          </div>
          <p className="pf-subtext">
            Tại đây bạn có thể xem các thông tin hiện tại của mình, chỉnh sửa
            ảnh đại diện và một số thông tin cá nhân.
            <br />
            Mã sinh viên sẽ không thể chỉnh sửa. Thông tin sẽ được{" "}
            <b>tự động lưu</b> khi bạn rời khỏi ô nhập.
          </p>
          {loadingProfile && (
            <p className="pf-avatar-note" style={{ marginTop: 8 }}>
              Đang tải thông tin hồ sơ...
            </p>
          )}
        </div>

        {/* --- Main content: avatar + form --- */}
        <div className="pf-main-row">
          {/* Avatar */}
          <section className="pf-avatar-block">
            <h2 className="pf-section-title">Ảnh đại diện</h2>

            <div className="pf-avatar-wrapper">
              <img className="pf-avatar-img" src={avatarUrl} alt="Avatar" />

              <button
                type="button"
                className="pf-avatar-upload-btn"
                onClick={handleClickAvatarButton}
                disabled={uploading}
              >
                <AvatarUploadIcon />
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/png, image/jpeg, image/webp"
                style={{ display: "none" }}
                onChange={handleFileChange}
              />
            </div>

            <p className="pf-avatar-note">
              Kích thước ảnh nhỏ nhất: 200 x 200px, định dạng PNG/JPG/WebP.
              <br />
              {uploading && <span>Đang tải ảnh lên...</span>}
            </p>
          </section>

          {/* Form */}
          <section className="pf-info-block">
            <h2 className="pf-section-title">Thông tin cá nhân</h2>

            <div className="pf-form-grid">
              <div className="pf-field">
                <label>Họ</label>
                <input
                  value={lastName}
                  onChange={handleLastNameChange}
                  onBlur={autoSaveProfile}
                />
              </div>

              <div className="pf-field">
                <label>Tên</label>
                <input
                  value={firstName}
                  onChange={handleFirstNameChange}
                  onBlur={autoSaveProfile}
                />
              </div>

              <div className="pf-field">
                <label>Số điện thoại</label>
                <input
                  value={phone}
                  onChange={handlePhoneChange}
                  onBlur={autoSaveProfile}
                />
              </div>

              <div className="pf-field">
                <label>Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={handleEmailChange}
                  onBlur={autoSaveProfile}
                />
              </div>

              <div className="pf-field">
                <label>Ngày sinh</label>
                <input
                  type="date"
                  value={dateOfBirth}
                  onChange={handleDobChange}
                  onBlur={autoSaveProfile}
                />
              </div>

              <div className="pf-field">
                <label>Mã sinh viên</label>
                <input value={studentCode} readOnly />
              </div>
            </div>

            {savingInfo && (
              <p className="pf-avatar-note" style={{ marginTop: 8 }}>
                Đang lưu thông tin...
              </p>
            )}
            {infoMessage && !savingInfo && (
              <p className="pf-avatar-note" style={{ marginTop: 8 }}>
                {infoMessage}
              </p>
            )}
            {error && <p className="pf-avatar-error">{error}</p>}

            <button type="button" className="pf-change-pass-btn">
              <LockIcon />
              <span>Đổi mật khẩu</span>
            </button>
          </section>
        </div>
      </div>
    </div>
  );
}
