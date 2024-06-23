

export interface EmployeeResponse {
  data: UserData[];
}

export interface UserData {
  id:number,
  name: string;
  address: string;
  mobile_number: number;
  email: string;
  status: string;
  role_id: number;
  role_name: string;
}
