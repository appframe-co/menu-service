import { Application } from "express";
import { SortOrder } from "mongoose";

export type RoutesInput = {
  app: Application,
}

export type TErrorResponse = {
  error: string|null;
  description?: string;
  property?: string;
}

export type TDoc = {[key: string]: any}

export type TItemModel = {
  id: string;
  projectId: string;
  userId: string;
  menuId: string;
  parentId: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  doc: TDoc;
  subject: string;
  subjectId: string;
}

export type TItem = {
  id: string;
  projectId: string;
  userId: string;
  menuId: string;
  parentId: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  doc: TDoc;
  items?: TItem[];
  subject: string;
  subjectId: string;
}

export type TItemInput = {
	id?: string;
	userId: string; 
	projectId: string;
	menuId: string;
  parentId?: string;
	doc?: TDoc;
  subject?: string;
  subjectId?: string;
}

type TValidationFieldModel = {
  code: string;
  type: string;
  value: any;
}

type TFieldModel = {
  id: string;
  type: string;
  name: string;
  key: string;
  description: string;
  validations: TValidationFieldModel[];
  system: boolean;
  unit: string;
}

export type TMenuModel = {
  id: string;
  userId: string;
  projectId: string;
  name: string;
  code: string;
  translations?: {
    enabled: boolean;
  };
  items: {
    fields: TFieldModel[];
  };
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

export type TMenu = {
  id: string;
  userId: string;
  projectId: string;
  name: string;
  code: string;
  translations?: {
    enabled: boolean;
  };
  items: {
    fields: {
      type: string;
      name: string;
    }[];
  };
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
  name: string;
  code: string;
  translations?: {
    enabled: boolean;
  };
  items: {
    fields: {
      type: string;
      name: string;
    }[];
  };
}

export type TParameters = {
  limit?: number;
  page?: number;
  sinceId?: string;
  ids?: string;
  sectionId?: string;
  parentId?: string;
  depthLevel?: number;
  code?: string;
}

type TValidationField = {
  type: string;
  code: string;
  value: any;
}
export type TField = {
  id: string;
  type: string;
  name: string;
  key: string;
  description: string;
  validations: TValidationField[];
  system: boolean;
  unit: string;
}

export type TFile = {
  id: string;
  filename: string;
  uuidName: string;
  width: number;
  height: number;
  size: number;
  mimeType: string;
  contentType: string;
  src: string;
}

type TMinNum = number | [number, string];
type TMinDate = Date | [Date, string];

export type TOptions = {
  required?: boolean | [boolean, string];
  unique?: boolean | [boolean, string];
  max?: TMinNum|TMinDate;
  min?: TMinNum|TMinDate;
  regex?: string | [string, string];
  choices?: string[]|number[];
  defaultValue?: any;
  value?: [string, any];
  max_precision?: number;
}

export type TValueTranslation = {[key: string]: any}

export type TTranslationModel = {
  id: string;
  userId: string; 
  projectId: string;
  menuId: string;
  subjectId: string;
  subject: string;
  key: string;
  value: TValueTranslation;
  lang: string;
  createdAt: string;
}

export type TTranslationInput = {
  id?: string;
	userId: string; 
  projectId: string;
  menuId: string;
  subjectId: string;
  subject: string;
  key: string;
  value: TValueTranslation;
  lang: string;
}

export type TTranslation = {
  id: string;
	userId: string; 
  projectId: string;
  menuId: string;
  subjectId: string;
  subject: string;
  key: string;
  value: TValueTranslation;
  lang: string;
  createdAt?: string;
}

export type TSort = {[key: string]: SortOrder};