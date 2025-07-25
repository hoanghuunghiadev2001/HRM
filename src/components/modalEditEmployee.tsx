import React, { useEffect, useState } from "react";
import {
  Button,
  DatePicker,
  Drawer,
  Form,
  GetProp,
  Input,
  message,
  Select,
  Upload,
  UploadProps,
} from "antd";
import ModalLoading from "./modalLoading";
import { LoadingOutlined, PlusOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { Department, InfoEmployee } from "@/lib/interface";
import Image from "next/image";
import { getUserFromLocalStorage } from "./api";

import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

// Extend plugin
dayjs.extend(utc);
dayjs.extend(timezone);

interface ModalEditEmployeeProps {
  open: boolean;
  onClose: () => void;
  employeeInfo?: InfoEmployee;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  handleUpdateEmployee: (employeeCode: string, infoEmployee: any) => void;
  department: Department[];
}

interface Position {
  id: number;
  name: string;
}

const ModalEditEmployee = ({
  onClose,
  open,
  employeeInfo,
  handleUpdateEmployee,
  department,
}: ModalEditEmployeeProps) => {
  const [imageUrl, setImageUrl] = useState<string>();
  const [loading, setLoading] = useState(false);
  const [seniorityText, setSeniorityText] = useState<number>(0);
  const [isMounted, setIsMounted] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState(0);
  const [positions, setPositions] = useState<Position[]>([]);
  type FileType = Parameters<GetProp<UploadProps, "beforeUpload">>[0];

  const localUser = getUserFromLocalStorage();

  const maxDate = dayjs();

  const { Option } = Select;
  const layout = {
    labelCol: { span: 8 },
    wrapperCol: { span: 16 },
  };

  const [form] = Form.useForm();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onFinish = async (formData: any) => {
    // Convert avatar File -> base64 nếu có
    // Chuẩn hóa object gửi đi
    const payload = {
      employeeCode: formData.employeeCode,
      name: formData.name,
      gender: formData.gender,
      birthDate: formData.birthDate,
      role: formData.role,
      avatar: imageUrl ?? null,

      workInfo: {
        department: formData.department,
        position: formData.position,
        specialization: formData.specialization,
        joinedTBD: formData.joinedTBD,
        joinedTeSCC: formData.joinedTeSCC,
        seniorityStart: formData.seniorityStart,
        seniority: formData.seniority,
        contractNumber: formData.contractNumber,
        contractDate: formData.contractDate,
        contractType: formData.contractType,
        contractEndDate: formData.contractEndDate,
      },

      personalInfo: {
        identityNumber: formData.identityNumber,
        issueDate: formData.issueDate,
        issuePlace: formData.issuePlace,
        hometown: formData.hometown,
        idAddress: formData.idAddress,
        education: formData.education,
        drivingLicense: formData.drivingLicense,
        toyotaCertificate: formData.toyotaCertificate,
        taxCode: formData.taxCode,
        insuranceNumber: formData.insuranceNumber,
        insuranceSalary: parseFloat(formData.insuranceSalary),
      },

      contactInfo: {
        phoneNumber: formData.phoneNumber,
        relativePhone: formData.relativePhone,
        companyPhone: formData.companyPhone,
        email: formData.email,
      },

      otherInfo: {
        workStatus: formData.workStatus,
        resignedDate: formData.resignedDate || null,
        documentsChecked: formData.documentsChecked ?? "",
        updatedAt: formData.updatedAt,
        VCB: formData.VCB,
        MTCV: formData.MTCV,
        PNJ: formData.PNJ,
      },
    };

    //   Gửi API

    if (employeeInfo?.employeeCode) {
      handleUpdateEmployee(employeeInfo?.employeeCode, payload);
    }
  };

  function handleDateChange(date: dayjs.Dayjs | null): number {
    if (!date) return 0;
    const today = dayjs();
    let totalMonths =
      (today.year() - date.year()) * 12 + (today.month() - date.month());
    if (today.date() < date.date()) totalMonths -= 1;
    setSeniorityText(totalMonths);
    return totalMonths;
  }

  function formatSeniorityText(months: number): string {
    const years = Math.floor(months / 12);
    const m = months % 12;
    return (
      `${years > 0 ? `${years} năm ` : ""}${
        m > 0 ? `${m} tháng` : ""
      }`.trim() || "0 tháng"
    );
  }

  //Up ảnh hồ sơ
  const beforeUpload = (file: FileType) => {
    const isJpgOrPng = file.type === "image/jpeg" || file.type === "image/png";
    if (!isJpgOrPng) {
      message.error("You can only upload JPG/PNG file!");
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error("Image must smaller than 2MB!");
    }
    return isJpgOrPng && isLt2M;
  };
  //chuyển ảnh sang base64
  const getBase64 = (img: FileType, callback: (url: string) => void) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => callback(reader.result as string));
    reader.readAsDataURL(img);
  };

  const handleChange: UploadProps["onChange"] = (info) => {
    if (info.file.status === "uploading") {
      setLoading(true);
      return;
    }
    if (info.file.status === "done") {
      // Get this url from response in real world.
      getBase64(info.file.originFileObj as FileType, (url) => {
        setLoading(false);
        setImageUrl(url);
      });
    }
  };

  const uploadButton = (
    <button style={{ border: 0, background: "none" }} type="button">
      {loading ? <LoadingOutlined /> : <PlusOutlined />}
      <div style={{ marginTop: 8 }}>Upload</div>
    </button>
  );

  const validateMessages = {
    required: "Vui lòng nhập ${label}",
    types: {
      email: "Chưa đúng định dạng",
      number: "${label} is not a valid number!",
    },
    number: {
      range: "${label} must be between ${min} and ${max}",
    },
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const normFile = (e: any) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e?.fileList;
  };

  function transformEmployeeDataToFormData(data: InfoEmployee) {
    return {
      employeeCode: data.employeeCode,
      name: data.name,
      gender: data.gender,
      birthDate: data.birthDate ? dayjs(data.birthDate, "DD/MM/YYYY") : null,
      password: data.password, // luôn mặc định
      role: data.role,
      avatarBase64: data.avatar ?? null,

      // workInfo
      department: data.workInfo?.department?.id ?? "",
      position: data.workInfo?.position?.id ?? "",
      specialization: data.workInfo?.specialization ?? "",
      joinedTBD: data.workInfo?.joinedTBD
        ? dayjs(data.workInfo?.joinedTBD, "DD/MM/YYYY")
        : null,
      joinedTeSCC: data.workInfo?.joinedTeSCC
        ? dayjs(data.workInfo?.joinedTeSCC, "DD/MM/YYYY")
        : null,
      seniorityStart: data.workInfo?.seniorityStart
        ? dayjs(data.workInfo?.seniorityStart, "DD/MM/YYYY")
        : null,
      seniority: formatSeniorityText(
        handleDateChange(dayjs(data.workInfo?.seniorityStart, "DD/MM/YYYY"))
      ),
      contractNumber: data.workInfo?.contractNumber ?? "",
      contractDate: data.workInfo?.contractDate
        ? dayjs(data.workInfo?.contractDate, "DD/MM/YYYY")
        : null,
      contractType: data.workInfo?.contractType ?? "",
      contractEndDate: data.workInfo?.contractEndDate
        ? dayjs(data.workInfo?.contractEndDate, "DD/MM/YYYY")
        : null,

      // personalInfo
      identityNumber: data.personalInfo?.identityNumber ?? "",
      issueDate: data.personalInfo?.issueDate
        ? dayjs(data.personalInfo?.issueDate, "DD/MM/YYYY")
        : null,
      issuePlace: data.personalInfo?.issuePlace ?? "",
      hometown: data.personalInfo?.hometown ?? "",
      idAddress: data.personalInfo?.idAddress ?? "",
      education: data.personalInfo?.education ?? "",
      drivingLicense: data.personalInfo?.drivingLicense ?? "",
      toyotaCertificate: data.personalInfo?.toyotaCertificate ?? "",
      taxCode: data.personalInfo?.taxCode ?? "",
      insuranceNumber: data.personalInfo?.insuranceNumber ?? "",
      insuranceSalary: data.personalInfo?.insuranceSalary || null,

      // contactInfo
      phoneNumber: data.contactInfo?.phoneNumber ?? "",
      relativePhone: data.contactInfo?.relativePhone ?? "",
      companyPhone: data.contactInfo?.companyPhone ?? "",
      email: data.contactInfo?.email ?? "",

      // otherInfo
      workStatus: data.otherInfo?.workStatus ?? "",
      resignedDate: data.otherInfo?.resignedDate
        ? dayjs
            .utc(data.otherInfo?.resignedDate)
            .tz("Asia/Ho_Chi_Minh")
            .format("DD/MM/YYYY")
        : null,
      documentsChecked: data.otherInfo?.documentsChecked ?? "",
      updatedAt: data.otherInfo?.updatedAt
        ? dayjs(data.otherInfo?.updatedAt, "DD/MM/YYYY")
        : null,
      VCB: data.otherInfo?.VCB ?? "",
      MTCV: data.otherInfo?.MTCV ?? "",
      PNJ: data.otherInfo?.PNJ ?? "",
    };
  }

  //lấy danh sách bộ phận
  // const listDepartment = async () => {
  //   const res = await fetch("/api/departments");
  //   if (!res.ok) throw new Error("Lấy dữ liệu thất bại");
  //   const departmentsData = await res.json(); //
  //   setDepartments(departmentsData);
  // };

  const listPosition = async () => {
    const res = await fetch(`/api/departments/${selectedDepartmentId}`);
    if (!res.ok) throw new Error("Lấy dữ liệu thất bại");
    const departmentsData = await res.json(); //
    setPositions(departmentsData.positions);
  };

  useEffect(() => {
    if (selectedDepartmentId) {
      listPosition();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDepartmentId]);

  const fetchData = async () => {
    console.log(selectedDepartmentId);

    try {
      const [positionsData] = await Promise.all([
        selectedDepartmentId
          ? fetch(`/api/departments/${selectedDepartmentId}`).then((res) =>
              res.json()
            )
          : Promise.resolve({ positions: [] }),
      ]);
      setPositions(positionsData.positions);
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu:", error);
    }
  };

  useEffect(() => {
    fetchData();
    setIsMounted(true); // Đánh dấu đã mount client
  }, []);

  useEffect(() => {
    if (isMounted && employeeInfo && open) {
      setImageUrl(employeeInfo.avatar);

      const date = dayjs
        .utc(employeeInfo.workInfo?.joinedTBD)
        .tz("Asia/Ho_Chi_Minh");
      console.log(date.format("DD/MM/YYYY"));

      form.setFieldsValue(transformEmployeeDataToFormData(employeeInfo));
      if (employeeInfo.workInfo?.department?.id) {
        setSelectedDepartmentId(employeeInfo.workInfo?.department?.id);
      }
      console.log(employeeInfo.workInfo?.department?.id ?? 0);
    }
    setDepartments(department);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [employeeInfo, isMounted]);

  return (
    <>
      <Drawer
        title={<p className="text-2xl">Thêm nhân sự</p>}
        placement="right"
        // size={"large"}
        onClose={onClose}
        width={900}
        open={open}
      >
        <ModalLoading isOpen={loading} />
        <div className="w-full">
          <div className="mt-2">
            <Form
              {...layout}
              form={form}
              name="control-hooks"
              onFinish={onFinish}
              className="w-full "
              labelCol={{ flex: "110px" }}
              labelAlign="left"
              labelWrap
              validateMessages={validateMessages}

              //   style={{ maxWidth: 600 }}
            >
              <div className="flex justify-center">
                <Form.Item
                  name="avatar"
                  valuePropName="fileList"
                  getValueFromEvent={normFile}
                >
                  <Upload
                    name="avatar"
                    listType="picture-circle"
                    className="avatar-uploader w-[155px] h-[155px] flex justify-center items-center"
                    showUploadList={false}
                    // action="https://660d2bd96ddfa2943b33731c.mockapi.io/api/upload"
                    beforeUpload={beforeUpload}
                    onChange={handleChange}
                  >
                    {imageUrl ? (
                      <Image
                        loading="lazy"
                        src={imageUrl}
                        alt="avatar"
                        style={{ width: "145px" }}
                        className="rounded-[50%] h-[145px] object-cover"
                        width={145}
                        height={145}
                        quality={70} // giảm chất lượng xuống chút để nhẹ hơn
                        priority={false}
                      />
                    ) : (
                      uploadButton
                    )}
                  </Upload>
                </Form.Item>
              </div>
              <div className="mb-2 mt-4">
                <p className="text-xl ">1. Thông Tin Cá Nhân:</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Form.Item
                  name="name"
                  label="Họ và tên"
                  rules={[{ required: true }]}
                >
                  <Input />
                </Form.Item>
                <Form.Item
                  name="gender"
                  label="Giới tính"
                  rules={[{ required: true }]}
                >
                  <Select placeholder="Giới tính" allowClear>
                    <Option value="MALE">Nam</Option>
                    <Option value="FEMALE">Nữ</Option>
                  </Select>
                </Form.Item>
                <Form.Item
                  name="role"
                  label="Vài trò"
                  rules={[{ required: true }]}
                >
                  <Select placeholder="Vài trò" allowClear>
                    {localUser?.role === "ADMIN" ? (
                      <Option value="ADMIN">ADMIN</Option>
                    ) : (
                      ""
                    )}
                    <Option value="MANAGER">MANAGER</Option>
                    <Option value="USER">USER</Option>
                  </Select>
                </Form.Item>
                <Form.Item
                  name="birthDate"
                  label="Ngày sinh"
                  rules={[{ required: true }]}
                >
                  <DatePicker
                    placeholder="Chọn ngày"
                    className="w-full"
                    format="DD/MM/YYYY"
                    disabledDate={(current) => {
                      return current && current > maxDate;
                    }}
                  />
                </Form.Item>
                <Form.Item
                  name="employeeCode"
                  label="Mã NV"
                  rules={[{ required: true }]}
                >
                  <Input />
                </Form.Item>
                <Form.Item
                  name="identityNumber"
                  label="Số CCCD"
                  rules={[{ required: true }]}
                >
                  <Input />
                </Form.Item>
                <Form.Item
                  name="issueDate"
                  label="Ngày cấp"
                  rules={[{ required: true }]}
                >
                  <DatePicker
                    placeholder="Chọn ngày"
                    className="w-full"
                    format="DD/MM/YYYY"
                    disabledDate={(current) => {
                      return current && current > maxDate;
                    }}
                  />
                </Form.Item>
                <Form.Item
                  name="issuePlace"
                  label="Nơi cấp"
                  rules={[{ required: true }]}
                >
                  <Input />
                </Form.Item>
                <Form.Item
                  name="hometown"
                  label="Nguyên quán"
                  rules={[{ required: true }]}
                >
                  <Input />
                </Form.Item>
                <Form.Item
                  name="idAddress"
                  label="Địa chỉ"
                  rules={[{ required: true }]}
                >
                  <Input />
                </Form.Item>
              </div>
              <div className="mb-2 mt-4">
                <p className="text-xl ">2. Thông Tin Liên Hệ:</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Form.Item
                  name="phoneNumber"
                  label="Số DT"
                  //   rules={[{ required: true }]}
                >
                  <Input type="number" />
                </Form.Item>
                <Form.Item
                  name="relativePhone"
                  label="SĐT người thân"
                  //   rules={[{ required: true }]}
                >
                  <Input type="number" />
                </Form.Item>
                <Form.Item
                  name="companyPhone"
                  label="SĐT Cty"
                  //   rules={[{ required: true }]}
                >
                  <Input type="number" />
                </Form.Item>
                <Form.Item
                  name={["email"]}
                  label="Email"
                  rules={[{ type: "email" }]}
                >
                  <Input />
                </Form.Item>
              </div>
              <div className="mb-2 mt-4">
                <p className="text-xl ">3. Thông Tin Công việc:</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Form.Item
                  name="department"
                  label="Bộ phận"
                  rules={[
                    { required: localUser?.role === "MANAGER" ? false : true },
                  ]}
                >
                  <Select
                    placeholder="Bộ phận"
                    disabled={localUser?.role === "MANAGER"}
                    allowClear
                    onChange={(value) => {
                      setSelectedDepartmentId(value);
                      form.setFieldValue("position", undefined);
                    }}
                    options={departments.map((d) => ({
                      value: d.id,
                      label: d.name,
                    }))}
                  ></Select>
                </Form.Item>
                <Form.Item
                  name="position"
                  label="Chức vụ"
                  rules={[{ required: true }]}
                >
                  <Select
                    placeholder="Chức vụ"
                    disabled={localUser?.role === "MANAGER"}
                    allowClear
                    options={positions.map((d) => ({
                      value: d.id,
                      label: d.name,
                    }))}
                  ></Select>
                </Form.Item>
                <Form.Item name="joinedTBD" label="Ngày vào TBD">
                  <DatePicker
                    placeholder="Chọn ngày"
                    className="w-full"
                    format="DD/MM/YYYY"
                    disabledDate={(current) => {
                      return current && current > maxDate;
                    }}
                  />
                </Form.Item>
                <Form.Item name="joinedTeSCC" label="Ngày vào TeSCC">
                  <DatePicker
                    placeholder="Chọn ngày"
                    className="w-full"
                    format="DD/MM/YYYY"
                    disabledDate={(current) => {
                      return current && current > maxDate;
                    }}
                  />
                </Form.Item>
                <Form.Item name="seniorityStart" label="Ngày tính TN">
                  <DatePicker
                    placeholder="Chọn ngày"
                    className="w-full"
                    format="DD/MM/YYYY"
                    onChange={handleDateChange}
                    disabledDate={(current) => {
                      return current && current > maxDate;
                    }}
                  />
                </Form.Item>
                <Form.Item
                  name="seniority"
                  label="Thâm niên"
                  valuePropName={formatSeniorityText(seniorityText)}
                  //   rules={[{ required: true }]}
                >
                  <Input
                    disabled
                    value={formatSeniorityText(seniorityText)}
                    // defaultValue={seniorityText}
                  />
                </Form.Item>
                <Form.Item
                  name="contractNumber"
                  label="Số HĐ"
                  //   rules={[{ required: true }]}
                >
                  <Input />
                </Form.Item>
                <Form.Item name="contractType" label="Loại HĐ">
                  <Input />
                </Form.Item>
                <Form.Item name="contractEndDate" label="Ngày hết hạn HĐ">
                  <DatePicker
                    placeholder="Chọn ngày"
                    className="w-full"
                    format="DD/MM/YYYY"
                  />
                </Form.Item>
              </div>
              <div className="mb-2 mt-4">
                <p className="text-xl ">4. Chứng chỉ & Trình độ:</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Form.Item name="education" label="Trình độ">
                  <Select
                    placeholder="Trình độ"
                    allowClear
                    options={[
                      { value: "TH", label: "Tiểu học" },
                      { value: "THCS", label: "THCS" },
                      { value: "THPT", label: "THPT" },
                      { value: "CD", label: "Cao Đẳng" },
                      { value: "DH", label: "Đại học" },
                      { value: "ThS", label: "Thạc sĩ" },
                      { value: "TS", label: "Tiến sĩ" },
                      { value: "PGS", label: "Phó giáo sư" },
                      { value: "GS", label: "Giáo sư" },
                    ]}
                  ></Select>
                </Form.Item>
                <Form.Item name="specialization" label="Chuyên ngành">
                  <Input />
                </Form.Item>
                <Form.Item name="drivingLicense" label="Bằng lái xe">
                  <Input />
                </Form.Item>
                <Form.Item name="toyotaCertificate" label="Chứng chỉ Toyota">
                  <Input />
                </Form.Item>
              </div>
              <div className="mb-2 mt-4">
                <p className="text-xl ">4. Thông tin bảo hiểm / Thuế:</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Form.Item name="taxCode" label="Mã số thuế">
                  <Input type="number" />
                </Form.Item>
                <Form.Item name="insuranceNumber" label="Số sổ BHXH">
                  <Input type="number" />
                </Form.Item>
                <Form.Item name="insuranceSalary" label="Lương đóng BH">
                  <Input type="number" />
                </Form.Item>
              </div>
              <div className="mb-2 mt-4">
                <p className="text-xl ">6. Thông tin khác:</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Form.Item
                  name="workStatus"
                  label="Trạng thái làm việc"
                  rules={[{ required: true }]}
                >
                  <Select
                    placeholder="Bộ phận"
                    allowClear
                    options={[
                      { value: "OFFICIAL", label: "Chính thức" },
                      { value: "PROBATION", label: "Học việc" },
                      { value: "RESIGNED", label: "Nghỉ việc" },
                    ]}
                  ></Select>
                </Form.Item>
                <Form.Item name="resignedDate" label="Ngày nghỉ">
                  <DatePicker
                    placeholder="Chọn ngày"
                    className="w-full"
                    format="DD/MM/YYYY"
                  />
                </Form.Item>
                <Form.Item name="documentsChecked" label="Kiểm tra hồ sơ">
                  <Input />
                </Form.Item>
                <Form.Item name="updatedAt" label="Thời gian cập nhật">
                  <DatePicker
                    placeholder="Chọn ngày"
                    className="w-full"
                    format="DD/MM/YYYY"
                  />
                </Form.Item>
                <Form.Item name="VCB" label="Ngân hàng VCB">
                  <Input />
                </Form.Item>
                <Form.Item name="MTCV" label="MTCV">
                  <Input />
                </Form.Item>
                <Form.Item name="PNJ" label="PNJ">
                  <Input />
                </Form.Item>
              </div>
              {/* <Form.Item {...tailLayout}>
                <Space>
                  <Button type="primary" htmlType="submit">
                    Submit
                  </Button>
                  <Button htmlType="button" onClick={onReset}>
                    Reset
                  </Button>
                  <Button type="link" htmlType="button" onClick={onFill}>
                    Fill form
                  </Button>
                </Space>
              </Form.Item> */}
              <Form.Item
                label={null}
                className="w-full flex justify-center mt-4"
              >
                <Button
                  htmlType="submit"
                  className="flex mt-4 relative  gap-2 items-center !h-10 !px-4 rounded-lg !bg-gradient-to-r from-[#c72929] to-[#350000] !text-lg cursor-pointer !text-white !font-semibold"
                >
                  Cập nhật nhân sự
                </Button>
              </Form.Item>
            </Form>
          </div>
        </div>
      </Drawer>
    </>
  );
};

export default ModalEditEmployee;
