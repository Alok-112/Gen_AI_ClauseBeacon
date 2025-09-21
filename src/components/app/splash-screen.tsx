'use client';
import { FileSearch } from 'lucide-react';
import { useState, useEffect } from 'react';

const APP_NAME = "ClauseBeacon";

export const SplashScreen = () => {
    const [typedName, setTypedName] = useState('');

    useEffect(() => {
        if (typedName.length < APP_NAME.length) {
            const timer = setTimeout(() => {
                setTypedName(APP_NAME.slice(0, typedName.length + 1));
            }, 150);
            return () => clearTimeout(timer);
        }
    }, [typedName]);

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-background fixed inset-0 z-[100]">
      <div className="flex flex-col items-center gap-8">
        <div className="relative flex items-center justify-center">
             <FileSearch className="h-20 w-20 text-primary animate-in fade-in-0 zoom-in-50 duration-1000" />
        </div>
        <h1 className="mt-16 text-3xl font-bold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-violet-500 to-purple-500 font-headline">
            {typedName}
            <span className="animate-blink border-r-2 border-purple-400 ml-1" aria-hidden="true"></span>
        </h1>
      </div>
    </div>
  );
};
