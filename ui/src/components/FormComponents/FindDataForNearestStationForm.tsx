import { JSX, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import "./FindDataForNearestStationForm.css";
  

export function FindDataForNearestStationForm(): JSX.Element {
 const { register, handleSubmit, formState: { errors } } = useForm();

  interface FormData {
    Longitude: number;
    Latitude: number;
  }

  const onSubmit = (data: FormData): void => console.log(data);
  console.log(errors);
  
  return (
    <div className="container">
      
    <form onSubmit={handleSubmit(onSubmit)}>
      <p>Click the Map to get results for nearest Air Quality Station</p>
      <input type="text" placeholder="Longitude" {...register("Longitude", {required: true, pattern: /^[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?)/i})} />
      
      <input type="text" placeholder="Latitude" {...register("Latitude", {required: true, pattern: /^[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?)/i})} />
      <p>
      <input type="submit" />
      </p>
    </form>
    </div>
  );
}
