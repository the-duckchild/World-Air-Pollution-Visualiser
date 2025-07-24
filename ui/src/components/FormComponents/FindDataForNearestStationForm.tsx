import { JSX, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import "./FindDataForNearestStationForm.css";
  

export function FindDataForNearestStationForm(): JSX.Element {
  interface FormData {
    Longitude: number;
    Latitude: number;
  }

 const { register, handleSubmit, formState: { errors } } = useForm<FormData>({defaultValues:{Longitude: 0, Latitude: 0}});

  const onSubmit = (data: FormData): void => console.log(data);
  console.log(errors);
  
  return (
    <div className="container">
      
    <form onSubmit={handleSubmit(onSubmit)}>
      <p className="font-medium">Click the Map to get results for nearest Air Quality Station</p>
      <div className= "flex flex-row justify-center">
      <div className="flex flex-col justify-center self-center">
      <p className="">Longitude</p>
      <input className="font-medium align-items-center" type="text" placeholder="Longitude" {...register("Longitude", {required: true, pattern: /^[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?)/i})} />
      </div>
      <div className="flex flex-col justify-self-center">
        <p className=" m-1px">
        Latitude
        </p>
      <input className="font-medium" type="text" placeholder="Latitude" {...register("Latitude", {required: true, pattern: /^[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?)/i})} />
      </div>
      </div>
      <p>
      <input className="font-medium" type="submit" />
      </p>
      
    </form>
    </div>
  );
}
