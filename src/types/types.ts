import { Application } from "express";

export type RoutesInput = {
  app: Application,
}

export type TErrorResponse = {
  error: string|null;
  description?: string;
  property?: string;
}

type TItem = {
  title: string;
  url: string;
  subject: string;
  subjectId: string;
  type: string;
  items: TItem[];
}

export type TMenuModel = {
  id: string;
  projectId: string;
  userId: string;
  title: string;
  handle: string;
  items: TItem[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

export type TMenu = {
  id: string;
  projectId: string;
  title: string;
  handle: string;
  items: TItem[];
  createdAt?: string;
  updatedAt?: string;
}

export type TMenusInput = {
  userId: string;
  projectId: string;
}
export type TMenuInput = {
	id?: string;
	userId: string; 
	projectId: string;
  title: string;
  handle: string;
  items: TItem;
}

export type TParameters = {
  limit?: number;
  page?: number;
  sinceId?: string;
  ids?: string;
}