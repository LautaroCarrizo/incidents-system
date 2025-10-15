
export interface UserInfoDto {
  id: number;
  name: string;
  email: string;
  isAdmin: boolean;
}

export interface UserListDto {
  id: number;
  name: string;
  email: string;
}

export function toUserInfoDto(row: any): UserInfoDto {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    isAdmin: !!row.isAdmin,
  };
}

export function toUserListDto(row: any): UserListDto {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
  };
}
