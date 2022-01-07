import consola from 'consola';

export class Logger {
  
  public static log( message:string ) : void {
    consola.log(message);
  }
  
  public static error( message:string|Error ) : void {
    consola.error(message);
  }
  
  
  public static warn( message:string ) : void {
    consola.warn(message);
  }
  
  public static info( message:string ) : void {
    consola.info(message);
  }
  
  public static success( message: string ) : void {
    consola.success(message);
  }
}

