// Tưởng tượng đây là src/components/DebounceSelect.jsx
import { Select, Spin } from 'antd';
import { useMemo, useRef, useState } from 'react';
import { debounce } from 'lodash';
import { UserApi } from "@/services/api/userApi"; // Cần import API User

// Hàm giả lập gọi API tìm kiếm user
async function fetchUserList(searchValue) {
  // GỌI API ĐỂ LỌC VÀ PHÂN TRANG TỪ SERVER-SIDE
  const users = await UserApi.getAll({ 
    role: 'student', 
    search: searchValue, 
    limit: 50 // Giới hạn 50 kết quả mỗi lần tìm kiếm
  });
  
  return users.map(u => ({
    label: `${u.full_name} (${u.email})`,
    value: u.user_id,
  }));
}

export function DebounceSelect({ fetchOptions, debounceTimeout = 800, ...props }) {
  const [fetching, setFetching] = useState(false);
  const [options, setOptions] = useState([]);
  const fetchRef = useRef(0);

  const debounceFetcher = useMemo(() => {
    const loadOptions = (value) => {
      fetchRef.current += 1;
      const fetchId = fetchRef.current;
      setOptions([]);
      setFetching(true);
      
      fetchOptions(value).then((newOptions) => {
        if (fetchId !== fetchRef.current) {
          // Kiem tra neu co request moi hon, bo qua ket qua nay
          return;
        }
        setOptions(newOptions);
        setFetching(false);
      });
    };

    return debounce(loadOptions, debounceTimeout);
  }, [fetchOptions, debounceTimeout]);

  return (
    <Select
      labelInValue
      filterOption={false} // Tắt lọc client
      onSearch={debounceFetcher}
      notFoundContent={fetching ? <Spin size="small" /> : 'Không tìm thấy'}
      {...props}
      options={options}
    />
  );
}
// Ví dụ về cách dùng fetcher:
export async function fetchStudentsForSelect(value) {
    return fetchUserList(value);
}

// BẠN CẦN THÊM CÁC DÒNG IMPORT SAU VÀO ClassDetail.jsx:
// import { DebounceSelect, fetchStudentsForSelect } from '@/components/DebounceSelect';
// import * as XLSX from 'xlsx'; // Đã có sẵn