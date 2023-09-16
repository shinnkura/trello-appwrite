import { database } from '@/appwrite';
import { Board, Column, TypedColumn } from '@/typings';

export const getTodoGroupedByColumn = async () => {
    const data = await database.listDocuments(
        process.env.NEXT_PUBLIC_DATABASE_ID!,
        process.env.NEXT_PUBLIC_TODOS_COLLECTION_ID!,
    );

    const todos = data.documents;

    console.log(todos);

    const columns = todos.reduce((acc, todo) => {
        if (!acc.get(todo.status)) {
            acc.set(todo.status, {
                id: todo.status,
                todos: []
            });
        }

        acc.get(todo.status)!.todos.push({
            $id: todo.$id,
            $createdAt: todo.$createdAt,
            title: todo.title,
            status: todo.status,
            ...(todo.image && { image: JSON.parse(todo.image) })
        });

        return acc;

    }, new Map<TypedColumn, Column>);

    // if columns dosent have inprogress, todo and done, and them with empty todos
    const columnTypes: TypedColumn[] = ["todo", "inprogress", "done"];

    for(const columnType of columnTypes){
        if(!columns.get(columnType)){
            columns.set(columnType, {
                id: columnType,
                todos: [],
            });
        }
    }

    console.log(columns);

    // sort columns by columnTypes
    const sortedColumns = new Map(
        Array.from(columns.entries()).sort((a, b) => (
            columnTypes.indexOf(a[0]) - columnTypes.indexOf(b[0])
        ))
    )

    const board: Board = {
        columns: sortedColumns
    };

    return board;
};
